type Lang = "ar" | "en";

export function formatToday(lang: Lang = "en"): string {
  const date = new Date();

  const days = {
    ar: [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ],
    en: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  };

  const months = {
    ar: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    en: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const dayName = days[lang][date.getDay()];
  const day = date.getDate();
  const month = months[lang][date.getMonth()];
  const year = date.getFullYear();

  return lang === "ar"
    ? `${dayName}، ${day} ${month} ${year}`
    : `${dayName}, ${month} ${day} ${year}`;
}
