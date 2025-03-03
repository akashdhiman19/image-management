import { useEffect, useState } from "react";
import client from "../lib/sanityClient";
import imageUrlBuilder from "@sanity/image-url";
import JSZip from "jszip";
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
  const [editData, setEditData] = useState({ title: "", tags: "", category: "" });

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

  const selectAllInFolder = (folder) => {
    const folderImages = categorizedImages[folder].map((img) => img._id);
    const allSelected = folderImages.every((id) => selectedImages.includes(id));
    setSelectedImages(allSelected ? selectedImages.filter((id) => !folderImages.includes(id)) : [...selectedImages, ...folderImages]);
  };

  const startEditing = (image) => {
    setEditImage(image);
    setEditData({ title: image.title, tags: image.tags.join(", "), category: image.category });
  };

  const saveEdit = async () => {
    await client.patch(editImage._id).set({
      title: editData.title,
      tags: editData.tags.split(",").map((tag) => tag.trim()),
      category: editData.category,
    }).commit();

    setImages(images.map((img) => (img._id === editImage._id ? { ...img, ...editData, tags: editData.tags.split(",") } : img)));
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
    const zip = new JSZip();
    for (const id of selectedImages) {
      const img = images.find((img) => img._id === id);
      const response = await fetch(urlFor(img.image));
      const blob = await response.blob();
      zip.file(`${img.title}.jpg`, blob);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "downloaded_images.zip");
    });
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
        <button
          className="p-2 bg-red-500 text-white rounded-md disabled:opacity-50"
          onClick={bulkDelete}
          disabled={selectedImages.length === 0}
        >
          Bulk Delete
        </button>
        <button
          className="p-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          onClick={bulkDownload}
          disabled={selectedImages.length === 0}
        >
          Bulk Download
        </button>
      </div>

      {/* Folder View */}
      {Object.entries(filteredImages).map(([folder, imgs]) => (
        <div key={folder} className="mb-6">
          <button
            className="w-full bg-gray-300 text-black font-semibold p-3 rounded-lg shadow-md text-left"
            onClick={() => toggleFolder(folder)}
          >
            {openFolders[folder] ? "▼" : "▶"} {folder}
          </button>
          {openFolders[folder] && (
            <>
              <button
                className="mt-2 p-2 bg-gray-600 text-white rounded-md"
                onClick={() => selectAllInFolder(folder)}
              >
                Select All in {folder}
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
                {imgs.map((img) => (
                  <div key={img._id} className="relative p-4 border rounded-lg shadow-lg bg-white">
                    <img
                      src={urlFor(img.image)}
                      alt={img.title}
                      className="rounded-lg w-full h-64 object-cover"
                    />
                    <h3 className="text-lg font-semibold text-black mt-2">{img.title}</h3>
                    <p className="text-gray-600">Tags: {img.tags.join(", ")}</p>
                    <p className="text-gray-600">Category: {img.category}</p>

                    {/* Select Checkbox */}
                    <input
                      type="checkbox"
                      className="absolute top-3 right-3 w-5 h-5"
                      checked={selectedImages.includes(img._id)}
                      onChange={() => toggleSelectImage(img._id)}
                    />

                    {/* Edit Button */}
                    <button
                      className="mt-2 bg-yellow-500 text-black p-1 rounded-md"
                      onClick={() => startEditing(img)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Edit Modal */}
      {editImage && (
        <div className="fixed inset-0 bg-black flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-xl text-black font-bold">Edit Image</h2>
            <input className="text-black" type="text" placeholder="Enter Title" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
            <input className="text-black" type="text" placeholder="Enter Tags" value={editData.tags} onChange={(e) => setEditData({ ...editData, tags: e.target.value })} />
            <input className="text-black" type="text" placeholder="Enter Category" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} />
            <button onClick={saveEdit} className="bg-green-500 text-white p-2 rounded-md mt-3">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
