// namespace App {

// __ 4a Validation
/* Using a type is an option but normally if defining an object an interface is 
     also a good approach. We could also have used a class an instantiated.
  */
export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number; // for length of string
  maxLength?: number;
  min?: number; // for actual number of people
  max?: number;
}

export function validate(validatableInput: Validatable): boolean {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  // != null includes null and undefined but we want to still check if minLength set to zero (ie falsy value).
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// }
