import { existsSync, readdirSync } from "node:fs";
import { extname, isAbsolute, posix } from "node:path";
import * as ts from "typescript";

type RegistryFile = {
  path: string;
  target?: string;
  type: string;
};

type RegistryItem = {
  dependencies?: string[];
  devDependencies?: string[];
  files?: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  type: string;
};

type Registry = {
  homepage: string;
  items: RegistryItem[];
};

const root = process.cwd();
const registryPath = posix.join(root, "registry.json");
const registry = (await Bun.file(registryPath).json()) as Registry;
const errors: string[] = [];

function report(message: string) {
  errors.push(message);
}

function stripRef(address: string) {
  const refIndex = address.lastIndexOf("#");
  return refIndex === -1 ? address : address.slice(0, refIndex);
}

function packageName(specifier: string) {
  if (specifier.startsWith("@")) {
    const scopeSlash = specifier.indexOf("/");
    const packageSlash = specifier.indexOf("/", scopeSlash + 1);
    const versionIndex = specifier.indexOf("@", scopeSlash + 1);
    const endIndexes = [packageSlash, versionIndex].filter((index) => index !== -1);
    return endIndexes.length === 0 ? specifier : specifier.slice(0, Math.min(...endIndexes));
  }

  const slashIndex = specifier.indexOf("/");
  const versionIndex = specifier.indexOf("@");
  const endIndexes = [slashIndex, versionIndex].filter((index) => index !== -1);
  return endIndexes.length === 0 ? specifier : specifier.slice(0, Math.min(...endIndexes));
}

function hasVersion(specifier: string) {
  if (specifier.startsWith("@")) {
    const slashIndex = specifier.indexOf("/");
    return slashIndex !== -1 && specifier.indexOf("@", slashIndex) !== -1;
  }

  return specifier.includes("@");
}

function sourceCandidates(path: string) {
  const extension = extname(path);
  if (extension) return [path];

  return [
    path,
    `${path}.ts`,
    `${path}.tsx`,
    `${path}.js`,
    `${path}.jsx`,
    `${path}.css`,
    posix.join(path, "index.ts"),
    posix.join(path, "index.tsx"),
    posix.join(path, "index.js"),
    posix.join(path, "index.jsx"),
  ];
}

function resolveSourceImport(importer: string, specifier: string) {
  if (specifier.startsWith("@/")) {
    return sourceCandidates(posix.join("src", specifier.slice(2)));
  }

  if (specifier.startsWith(".")) {
    return sourceCandidates(posix.normalize(posix.join(posix.dirname(importer), specifier)));
  }

  return [];
}

function importedSpecifiers(file: RegistryFile) {
  const source = Bun.file(posix.join(root, file.path));
  const extension = extname(file.path);

  if ([".ts", ".tsx", ".js", ".jsx"].includes(extension)) {
    return source
      .text()
      .then((content) =>
        ts.preProcessFile(content, true, true).importedFiles.map(({ fileName }) => fileName),
      );
  }

  if (extension === ".css") {
    return source
      .text()
      .then((content) =>
        [...content.matchAll(/@import\s+["']([^"']+)["']/g)].map((match) => match[1]),
      );
  }

  return Promise.resolve([]);
}

const repositoryAddress = new URL(registry.homepage).pathname.replace(/^\/|\.git$/g, "");
const repositoryPrefix = `${repositoryAddress}/`;
const items = new Map<string, RegistryItem>();

for (const item of registry.items) {
  if (items.has(item.name)) {
    report(`duplicate item name: ${item.name}`);
  }
  items.set(item.name, item);
}

function localDependencyName(address: string) {
  const dependency = stripRef(address);
  return dependency.startsWith(repositoryPrefix) ? dependency.slice(repositoryPrefix.length) : null;
}

for (const item of registry.items) {
  const sourcePaths = new Set<string>();

  for (const dependency of item.registryDependencies ?? []) {
    const localName = localDependencyName(dependency);
    if (localName && !items.has(localName)) {
      report(`${item.name}: unresolved same-repository dependency "${dependency}"`);
    }
  }

  for (const key of ["dependencies", "devDependencies"] as const) {
    const seenPackages = new Set<string>();

    for (const dependency of item[key] ?? []) {
      const name = packageName(dependency);
      if (!name) {
        report(`${item.name}: invalid ${key} entry "${dependency}"`);
      } else if (seenPackages.has(name)) {
        report(`${item.name}: duplicate ${key} package "${name}"`);
      } else {
        seenPackages.add(name);
      }

      if (!hasVersion(dependency)) {
        report(`${item.name}: ${key} entry "${dependency}" must include a version range`);
      }
    }
  }

  for (const file of item.files ?? []) {
    const normalizedPath = posix.normalize(file.path);
    if (isAbsolute(file.path) || normalizedPath === ".." || normalizedPath.startsWith("../")) {
      report(`${item.name}: unsafe source path "${file.path}"`);
    } else if (!existsSync(posix.join(root, file.path))) {
      report(`${item.name}: source file does not exist: ${file.path}`);
    }

    if (sourcePaths.has(file.path)) {
      report(`${item.name}: duplicate source file "${file.path}"`);
    }
    sourcePaths.add(file.path);

    if (["registry:file", "registry:page"].includes(file.type) && !file.target) {
      report(`${item.name}: ${file.type} file "${file.path}" requires a target`);
    }

    if (file.target) {
      const target = file.target.replace(/^~\//, "");
      const normalizedTarget = posix.normalize(target);
      if (isAbsolute(target) || normalizedTarget === ".." || normalizedTarget.startsWith("../")) {
        report(`${item.name}: unsafe target "${file.target}"`);
      }
    }
  }
}

const visitState = new Map<string, "visiting" | "visited">();

function visit(itemName: string, stack: string[]) {
  const state = visitState.get(itemName);
  if (state === "visited") return;
  if (state === "visiting") {
    const cycleStart = stack.indexOf(itemName);
    report(`registry dependency cycle: ${[...stack.slice(cycleStart), itemName].join(" -> ")}`);
    return;
  }

  visitState.set(itemName, "visiting");
  const item = items.get(itemName);
  for (const address of item?.registryDependencies ?? []) {
    const dependencyName = localDependencyName(address);
    if (dependencyName && items.has(dependencyName)) {
      visit(dependencyName, [...stack, itemName]);
    }
  }
  visitState.set(itemName, "visited");
}

for (const item of registry.items) {
  visit(item.name, []);
}

const closureCache = new Map<string, Set<string>>();

function dependencyClosure(itemName: string, active = new Set<string>()): Set<string> {
  const cached = closureCache.get(itemName);
  if (cached) return cached;
  if (active.has(itemName)) return new Set([itemName]);

  const closure = new Set([itemName]);
  const nextActive = new Set(active).add(itemName);
  const item = items.get(itemName);

  for (const address of item?.registryDependencies ?? []) {
    const dependencyName = localDependencyName(address);
    if (!dependencyName || !items.has(dependencyName)) continue;
    for (const transitiveName of dependencyClosure(dependencyName, nextActive)) {
      closure.add(transitiveName);
    }
  }

  closureCache.set(itemName, closure);
  return closure;
}

for (const item of registry.items) {
  const closureNames = dependencyClosure(item.name);
  const closureItems = [...closureNames].flatMap((name) => {
    const dependency = items.get(name);
    return dependency ? [dependency] : [];
  });
  const availableFiles = new Set(
    closureItems.flatMap((dependency) => dependency.files ?? []).map((file) => file.path),
  );
  const availablePackages = new Set(
    closureItems.flatMap((dependency) => [
      ...(dependency.dependencies ?? []).map(packageName),
      ...(dependency.devDependencies ?? []).map(packageName),
    ]),
  );

  if (item.type === "registry:ui" && !closureNames.has("stitch-base")) {
    report(`${item.name}: UI item dependency closure does not include stitch-base`);
  }

  for (const file of item.files ?? []) {
    for (const specifier of await importedSpecifiers(file)) {
      const sourceImports = resolveSourceImport(file.path, specifier);
      if (sourceImports.length > 0) {
        if (!sourceImports.some((candidate) => availableFiles.has(candidate))) {
          report(`${item.name}: "${file.path}" imports undeclared registry source "${specifier}"`);
        }
        continue;
      }

      if (
        specifier.startsWith("node:") ||
        specifier.startsWith("bun:") ||
        specifier.startsWith("http://") ||
        specifier.startsWith("https://")
      ) {
        continue;
      }

      const dependency = packageName(specifier);
      if (!availablePackages.has(dependency)) {
        report(`${item.name}: "${file.path}" imports undeclared npm package "${dependency}"`);
      }
    }
  }
}

const base = items.get("stitch-base");
const baselineDependencies: Record<"dependencies" | "devDependencies", Record<string, RegExp>> = {
  dependencies: {
    "@base-ui/react": /^\^1\./,
    "@phosphor-icons/react": /^\^2\./,
    react: /^\^19\./,
    "react-dom": /^\^19\./,
  },
  devDependencies: {
    "@types/react": /^\^19(?:\.|$)/,
    "@types/react-dom": /^\^19(?:\.|$)/,
    oxfmt: /^\^0\./,
    oxlint: /^\^1\./,
    shadcn: /^\^4\./,
    tailwindcss: /^\^4(?:\.|$)/,
    typescript: /^\^5(?:\.|$)/,
  },
};

if (!base) {
  report('required modular base item "stitch-base" is missing');
} else {
  for (const key of ["dependencies", "devDependencies"] as const) {
    const versions = new Map(
      (base[key] ?? []).map((dependency) => {
        const name = packageName(dependency);
        return [name, dependency.slice(name.length + 1)] as const;
      }),
    );

    for (const [name, range] of Object.entries(baselineDependencies[key])) {
      const version = versions.get(name);
      if (!version || !range.test(version)) {
        report(`${base.name}: ${key} must include ${name} with a compatible ${range} range`);
      }
    }
  }
}

const viteRootTsconfig = (await Bun.file(
  posix.join(root, "registry/scaffolds/vite/tsconfig.json"),
).json()) as {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
};
if (!viteRootTsconfig.compilerOptions?.paths?.["@/*"]?.includes("./src/*")) {
  report(
    'stitch-vite: root tsconfig must expose "@/*" so subsequent shadcn updates resolve configured targets',
  );
}

const artifactDirectory = posix.join(root, "public/r");
const actualArtifacts = new Set(
  existsSync(artifactDirectory)
    ? readdirSync(artifactDirectory).filter((name) => name.endsWith(".json"))
    : [],
);
const expectedArtifacts = new Set([
  "registry.json",
  ...registry.items.map((item) => `${item.name}.json`),
]);

for (const artifact of expectedArtifacts) {
  if (!actualArtifacts.has(artifact)) {
    report(`missing generated artifact public/r/${artifact}`);
  }
}
for (const artifact of actualArtifacts) {
  if (!expectedArtifacts.has(artifact)) {
    report(`orphaned generated artifact public/r/${artifact}`);
  }
}

if (errors.length > 0) {
  console.error(
    `Registry audit failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`,
  );
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Registry audit passed: ${registry.items.length} items, dependency closure, imports, targets, baseline, and artifact inventory.`,
);
