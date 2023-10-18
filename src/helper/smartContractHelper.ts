export const getSmartContractCleanErrorMessage = (error: any) => {
  let errorMessage = error.toString();

  let startIndex = errorMessage.indexOf('Error:');
  let endIndex = errorMessage.indexOf('(');
  let cleanErrorMessage = errorMessage;

  if (startIndex !== -1 && endIndex !== -1) {
    cleanErrorMessage = errorMessage
      .substring(startIndex + 6, endIndex)
      .trim()
      .toLowerCase();
    cleanErrorMessage =
      cleanErrorMessage.charAt(0).toUpperCase() + cleanErrorMessage.slice(1);

    if (
      cleanErrorMessage &&
      !cleanErrorMessage.endsWith('.') &&
      !cleanErrorMessage.endsWith('!') &&
      !cleanErrorMessage.endsWith('?')
    ) {
      cleanErrorMessage += '.';
    }
  }

  return cleanErrorMessage;
};
