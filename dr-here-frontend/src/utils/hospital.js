export const getHospital = () => {
  const data = localStorage.getItem("hospital");
  return data ? JSON.parse(data) : null;
};

export const logoutHospital = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("hospital");
};
