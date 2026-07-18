type SearchParamValue = string | number | boolean | null | undefined;
type SearchParamPatch = Readonly<Record<string, SearchParamValue>>;

type PatchSearchParamsOptions = {
  defaults?: SearchParamPatch;
  resetKeys?: readonly string[];
};

function serializeSearchParamValue(value: Exclude<SearchParamValue, null | undefined>) {
  return String(value);
}

function patchSearchParams(
  searchParams: URLSearchParams,
  patch: SearchParamPatch,
  options: PatchSearchParamsOptions = {},
) {
  const nextSearchParams = new URLSearchParams(searchParams);
  const { defaults = {}, resetKeys = [] } = options;

  for (const key of resetKeys) {
    nextSearchParams.delete(key);
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value == null) {
      nextSearchParams.delete(key);
      continue;
    }

    const serializedValue = serializeSearchParamValue(value);
    const defaultValue = defaults[key];

    if (defaultValue != null && serializedValue === serializeSearchParamValue(defaultValue)) {
      nextSearchParams.delete(key);
      continue;
    }

    nextSearchParams.set(key, serializedValue);
  }

  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (defaultValue == null) {
      continue;
    }

    const values = nextSearchParams.getAll(key);
    if (values.length === 1 && values[0] === serializeSearchParamValue(defaultValue)) {
      nextSearchParams.delete(key);
    }
  }

  return nextSearchParams;
}

function buildSearchParamsHref(
  pathname: string,
  searchParams: URLSearchParams,
  patch: SearchParamPatch = {},
  options: PatchSearchParamsOptions = {},
) {
  const hashIndex = pathname.indexOf("#");
  const basePath = hashIndex === -1 ? pathname : pathname.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : pathname.slice(hashIndex);
  const query = patchSearchParams(searchParams, patch, options).toString();

  return `${basePath}${query ? `?${query}` : ""}${hash}`;
}

export {
  buildSearchParamsHref,
  patchSearchParams,
  serializeSearchParamValue,
  type PatchSearchParamsOptions,
  type SearchParamPatch,
  type SearchParamValue,
};
