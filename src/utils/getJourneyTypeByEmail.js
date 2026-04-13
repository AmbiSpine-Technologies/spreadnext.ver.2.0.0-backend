export const getJourneyTypeByEmail = (email) => {
  const emailLower = email.toLowerCase();

  if (emailLower.startsWith("hr@")) return "Recruiter";
  if (emailLower.startsWith("tpo@")) return "TPO";

  return null; // ❗ important
};
