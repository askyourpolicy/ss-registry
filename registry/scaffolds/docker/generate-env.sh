#!/usr/bin/env bash

set -e

PROJECT_NAME=$1
ENV_NAME=$2
COMPONENT_NAME=${3:-frontend}
AWS_REGION=${AWS_REGION:-us-east-2}

if [ -z "$PROJECT_NAME" ] || [ -z "$ENV_NAME" ]; then
  echo "Usage: ./generate-env.sh <project_name> <env_name> [component_name]"
  exit 1
fi

AWS_PROFILE="${AWS_PROFILE:-${PROJECT_NAME}-${ENV_NAME}}"
SECRET_ID="${PROJECT_NAME}/${ENV_NAME}/${COMPONENT_NAME}"
ENV_FILE=".env.${PROJECT_NAME}-${ENV_NAME}"

echo "--------------------------------------------"
echo "Project      : $PROJECT_NAME"
echo "Environment  : $ENV_NAME"
echo "AWS Profile  : $AWS_PROFILE"
echo "AWS Region   : $AWS_REGION"
echo "Secret ID    : $SECRET_ID"
echo "Env File     : $ENV_FILE"
echo "--------------------------------------------"

# If file already exists, skip fetching (developer override support)
if [ -f "$ENV_FILE" ]; then
  echo "Env file $ENV_FILE already exists. Skipping secret fetch."
  exit 0
fi

echo "Fetching secrets from AWS Secrets Manager..."

# Detect if AWS credentials are already available (CI / OIDC / env-based auth)
if aws sts get-caller-identity >/dev/null 2>&1; then
  echo "Using existing AWS environment credentials"
  PROFILE_ARG=""
else
  echo "No environment credentials detected. Using profile: $AWS_PROFILE"
  PROFILE_ARG="--profile $AWS_PROFILE"
fi

SECRET_JSON=$(aws secretsmanager get-secret-value \
  $PROFILE_ARG \
  --region "$AWS_REGION" \
  --secret-id "$SECRET_ID" \
  --query SecretString \
  --output text)

if [ -z "$SECRET_JSON" ]; then
  echo "Failed to fetch secret or secret is empty."
  exit 1
fi

echo "Converting secret JSON to env format..."

echo "$SECRET_JSON" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > "$ENV_FILE"

echo "Env file generated successfully: $ENV_FILE"
