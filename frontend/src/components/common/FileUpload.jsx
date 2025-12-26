import { useRef } from "react";
import axios from "../../api/axios";

const FileUpload = ({ endpoint, onSuccess }) => {
  const fileInput = useRef();
  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
    if (onSuccess) onSuccess();
  };
  return (
    <div>
      <input type="file" ref={fileInput} className="mb-2" />
      <button onClick={handleUpload} className="bg-primary-600 text-white px-4 py-2 rounded">
        Upload Excel
      </button>
    </div>
  );
};
export default FileUpload; 