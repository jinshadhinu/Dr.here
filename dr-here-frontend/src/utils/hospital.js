export const logoutHospital = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("hospital"); // if exists
};
