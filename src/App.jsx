import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCopy, FaUpload } from "react-icons/fa";

const PINATA_API_KEY = "073de05bf94bbc65a93c"; // Replace with actual API Key
const PINATA_SECRET_KEY = "f3a91e8116417ebab5264562ae30d9ec7a6de710fb6fd48d527c01e3a0756abe"; // Replace with actual Secret Key

const App = () => {
  const [formData, setFormData] = useState({
    evidence_id: "",
    case_id: "",
    time: "",
    date: "",
    latitude: "",
    longitude: "",
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const uploadFileToPinata = async (file) => {
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("File upload failed:", error);
      return null;
    }
  };

  const uploadJSONToPinata = async (data) => {
    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("JSON upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const attachmentHash = await uploadFileToPinata(attachmentFile);
      if (!attachmentHash) {
        setLoading(false);
        return;
      }

      const metadata = {
        ...formData,
        attachment_hash: attachmentHash,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
      };

      const metadataHash = await uploadJSONToPinata(metadata);
      setJsonIpfsHash(metadataHash);
    } catch (error) {
      console.error("Error uploading data:", error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Digital Evidence Manager</h2>
        <form className="space-y-4">
          <input type="text" name="evidence_id" placeholder="Evidence ID" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none" />
          <input type="text" name="case_id" placeholder="Case ID" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none" />
          <input type="file" onChange={handleFileChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
          <input type="text" name="time" placeholder="Time" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
          <input type="text" name="date" placeholder="Date" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
          <input type="text" name="latitude" placeholder="Latitude" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
          <input type="text" name="longitude" placeholder="Longitude" onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full flex items-center justify-center p-3 bg-blue-600 rounded hover:bg-blue-500 transition-all"
          >
            {loading ? "Uploading..." : <><FaUpload className="mr-2" /> Submit</>}
          </button>
        </form>
        {jsonIpfsHash && (
          <div className="mt-6 p-4 bg-gray-700 rounded">
            <p className="text-center font-semibold">Metadata CID:</p>
            <div className="flex justify-between items-center mt-2">
              <span className="truncate">{jsonIpfsHash}</span>
              <button onClick={() => navigator.clipboard.writeText(jsonIpfsHash)}>
                <FaCopy className="text-gray-300 hover:text-white" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default App;
