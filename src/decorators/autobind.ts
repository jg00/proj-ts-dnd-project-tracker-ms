// namespace App {

// __ 2 autoBind Decorator - add to submitHandler
export function autoBind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  /*
  console.log(target);
  console.log(methodName);
  console.log(descriptor.value); // submitHandler()
  */

  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this); // Note 'this' references the instantiated class where the method is defined
      return boundFn;
    },
  };

  return adjustedDescriptor;
}

// }
