import axios from "../../api/axios";

const ReportDownload = ({ type, id }) => {
  const handleDownload = async () => {
    const url = `/reports/${type}/${id}`;
    try {
      const res = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${type}_report.pdf`;
      link.click();
    } catch (err) {
      alert("Failed to download report. Please try again later.");
    }
  };
  return (
    <button onClick={handleDownload} className="bg-primary-600 text-white px-4 py-2 rounded">
      Download {type} Report
    </button>
  );
};
export default ReportDownload; 