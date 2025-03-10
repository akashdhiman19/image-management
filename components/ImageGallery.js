import { useEffect, useState } from "react";
import client from "../lib/sanityClient";
import imageUrlBuilder from "@sanity/image-url";
import { saveAs } from "file-saver";

const builder = imageUrlBuilder(client);

function urlFor(source, width = 800) {
  return builder.image(source).width(width).url();
}

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [editImage, setEditImage] = useState(null);
  const [editData, setEditData] = useState({ title: "", tags: "" });
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      const query = `*[_type == "imageAsset"]{_id, title, tags, category, folder, image}`;
      const result = await client.fetch(query);
      setImages(result);
    };

    fetchImages();
  }, []);

  const toggleFolder = (folder) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const startEditing = (image) => {
    setEditImage(image);
    setEditData({ title: image.title, tags: image.tags.join(", ") });
  };

  const saveEdit = async () => {
    if (!editImage) return;
    
    await client.patch(editImage._id).set({
      title: editData.title,
      tags: editData.tags.split(",").map((tag) => tag.trim())
    }).commit();

    setImages(images.map((img) => 
      img._id === editImage._id ? { ...img, ...editData, tags: editData.tags.split(",") } : img
    ));
    
    setEditImage(null);
  };

  const bulkDelete = async () => {
    if (selectedImages.length === 0) return alert("No images selected");
    for (const id of selectedImages) {
      await client.delete(id);
    }
    setImages(images.filter((img) => !selectedImages.includes(img._id)));
    setSelectedImages([]);
  };

  const bulkDownload = async () => {
    if (selectedImages.length === 0) return alert("No images selected");
    for (const id of selectedImages) {
      const img = images.find((img) => img._id === id);
      const response = await fetch(urlFor(img.image));
      const blob = await response.blob();
      saveAs(blob, `${img.title}.jpg`);
    }
  };

  const sendToWhatsApp = async () => {
    if (selectedImages.length === 0) return alert("No images selected");

    const imageBlobs = [];

    for (const id of selectedImages) {
      const img = images.find((img) => img._id === id);
      const response = await fetch(urlFor(img.image));
      const blob = await response.blob();
      imageBlobs.push(blob);
    }

    const files = imageBlobs.map((blob) => new File([blob], "image.jpg", { type: "image/jpeg" }));
    const shareData = { files };

    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        alert("Error sharing images: " + error.message);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const categorizedImages = images.reduce((acc, img) => {
    if (!acc[img.folder]) acc[img.folder] = [];
    acc[img.folder].push(img);
    return acc;
  }, {});

  const filteredImages = Object.entries(categorizedImages).reduce((acc, [folder, imgs]) => {
    acc[folder] = imgs.filter(
      (img) =>
        img.title.toLowerCase().includes(searchQuery) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery)) ||
        img.category.toLowerCase().includes(searchQuery)
    );
    return acc;
  }, {});

  return (
    
    <div className="p-5 bg-gray-100 min-h-screen">
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <img
            src={urlFor(fullscreenImage.image, 1200)}
            alt={fullscreenImage.title}
            className="max-w-full max-h-full rounded-lg"
          />
          <button
            className="absolute top-5 right-5 bg-red-500 text-white p-2 rounded-full"
            onClick={() => setFullscreenImage(null)}
          >
            ✖
          </button>
        </div>
      )}
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search images..."
        className="w-full p-3 border rounded-lg mb-4 text-black"
        value={searchQuery}
        onChange={handleSearch}
      />

      {/* Bulk Actions */}
      <div className="mb-4 flex gap-4">
        <button className="p-2 bg-red-500 text-white rounded-md" onClick={bulkDelete}>
          Bulk Delete
        </button>
        <button className="p-2 bg-blue-500 text-white rounded-md" onClick={bulkDownload}>
          Bulk Download
        </button>
        <button className="p-2 bg-green-500 text-white rounded-md" onClick={sendToWhatsApp}>
          Send to WhatsApp
        </button>
      </div>

      {/* Folder View */}
      {Object.entries(filteredImages).map(([folder, imgs]) => (
        <div key={folder} className="mb-6">
          <button className="w-full bg-gray-300 text-black font-semibold p-3 rounded-lg shadow-md" onClick={() => toggleFolder(folder)}>
            {openFolders[folder] ? "▼" : "▶"} {folder}
          </button>
          {openFolders[folder] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
              {imgs.map((img) => (
                <div key={img._id} className="relative p-4 border rounded-lg shadow-lg bg-white">
                  <img
                    src={urlFor(img.image)}
                    alt={img.title}
                    className="rounded-lg w-full h-64 object-cover cursor-pointer"
                    onClick={() => setFullscreenImage(img)}
                  />
                  <h3 className="text-lg font-semibold text-black mt-2">{img.title}</h3>
                  <p className="text-gray-600">Tags: {img.tags.join(", ")}</p>

                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    className="absolute top-3 right-3 w-5 h-5"
                    checked={selectedImages.includes(img._id)}
                    onChange={() => toggleSelectImage(img._id)}
                  />

                  {/* Edit Button */}
                  <button className="mt-2 bg-yellow-500 text-black p-1 rounded-md" onClick={() => startEditing(img)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Edit Modal */}
      {editImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Image</h2>
            <input
              type="text"
              className="border p-2 w-full mb-3"
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
            <input
              type="text"
              className="border p-2 w-full mb-3"
              placeholder="Tags (comma-separated)"
              value={editData.tags}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
            />
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white p-2 rounded-md" onClick={saveEdit}>
                Save
              </button>
              <button className="bg-red-500 text-white p-2 rounded-md" onClick={() => setEditImage(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
