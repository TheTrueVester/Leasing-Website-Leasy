function convertToDate(dateString?: string | null): Date | undefined {
  if (!dateString) return undefined;
  const [day, month, year] = dateString.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date;
}

function dateFormatter(date?: Date, delimiter = "-"): string {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}${delimiter}${month}${delimiter}${year}`; // dd-mm-yyyy
}

const prettyDate = (date: Date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "N/A";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (minutes <= 1) return "just now";
  else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours === 1 ? "an hour" : `${hours} hours`} ago`;
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (weeks < 4) {
    return `${weeks} weeks ago`;
  } else if (months < 12) {
    return `${months} months ago`;
  } else {
    return `${years} years ago`;
  }
};

export { convertToDate, dateFormatter, prettyDate, getTimeAgo };
