import { useState } from "react";
import client from "../lib/sanityClient";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";

const FOLDERS = [
  "Luxury Bus (Victor)",
  "Luxury Bus (Kasper)",
  "Luxury Bus (Tourista)",
  "Luxury Bus (Hymer)",
  "Luxury Bus (Spider-Seater)",
  "Luxury Bus (Arrow)",
  "Sleeper Bus(Spider)",
  "Deluxe Buses",
  "Institutional Buses",
  "Special Purpose Buses",
];

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [folder, setFolder] = useState(FOLDERS[0]); // Default to first folder
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files) => {
    setUploading(true);
    setUploadProgress(0);

    let uploadedCount = 0;
    let imagesToUpload = [];

    for (const file of files) {
      if (file.name.endsWith(".zip")) {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        const zipFiles = Object.values(zipData.files);

        for (const zipFile of zipFiles) {
          if (!zipFile.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;
          const imageBlob = await zipFile.async("blob");
          const extractedFile = new File([imageBlob], zipFile.name, { type: "image/*" });
          imagesToUpload.push(extractedFile);
        }
      } else {
        imagesToUpload.push(file);
      }
    }

    for (const imageFile of imagesToUpload) {
      const asset = await client.assets.upload("image", imageFile);
      await client.create({
        _type: "imageAsset",
        title,
        tags: tags.split(",").map((tag) => tag.trim()),
        category,
        folder, // Store selected folder
        image: { _type: "image", asset: { _ref: asset._id } },
      });

      uploadedCount++;
      setUploadProgress((uploadedCount / imagesToUpload.length) * 100);
    }

    setUploading(false);
    alert(`Uploaded ${uploadedCount} images to '${folder}' successfully!`);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileUpload,
    multiple: true,
    accept: "image/*, .zip",
  });

  return (
    <div className="max-w-xl mx-auto p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-black text-center mb-4">Upload Images / ZIP Files</h2>

      <input
        type="text"
        placeholder="Title"
        className="w-full p-2 border rounded-md mb-2 text-black"
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Tags (comma separated)"
        className="w-full p-2 border rounded-md mb-2 text-black"
        onChange={(e) => setTags(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category"
        className="w-full p-2 border rounded-md mb-2 text-black"
        onChange={(e) => setCategory(e.target.value)}
      />

      <select
        className="w-full p-2 border rounded-md mb-2 text-black"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
      >
        {FOLDERS.map((folderName) => (
          <option key={folderName} value={folderName}>
            {folderName}
          </option>
        ))}
      </select>

      <div
        {...getRootProps()}
        className="p-5 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500 transition text-black"
      >
        <input {...getInputProps()} />
        <p>Drag & drop multiple images or ZIP file, or click to select</p>
      </div>

      <button
        disabled={uploading}
        className={`w-full mt-4 p-2 text-white rounded-md ${
          uploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 transition"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {uploading && (
        <div className="mt-4 bg-gray-200 h-3 rounded-lg overflow-hidden">
          <div
            className="bg-blue-500 h-full"
            style={{ width: `${uploadProgress}%`, transition: "width 0.3s ease-in-out" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
