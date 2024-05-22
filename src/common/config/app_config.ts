
const ENVIRONMENTS = Object.freeze({
  PROD: "production",
  DEV: "development",
  UAT: "user acceptance testing",
  STAGING: "staging"
});

const JoiValidatorOptions = {
  errors: {
    wrap: {
      label: ""
    }
  },
  stripUnknown: true,
  abortEarly: false,
  allowUnknown: false
};

export {
  ENVIRONMENTS,
  JoiValidatorOptions
}