const envs = {
  STAGE: null,
};
let envsAreValidated = false;

export function getEnvVars(): typeof envs {
  if (!envsAreValidated) {
    validateEnvs();
  }
  return envs;
}

export function validateEnvs() {}
