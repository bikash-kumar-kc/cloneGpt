export const initializeMicrophone = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
