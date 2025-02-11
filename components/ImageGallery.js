import { useEffect, useState, useRef } from "react";
import client from "../lib/sanityClient";
import imageUrlBuilder from "@sanity/image-url";
import gsap from "gsap";

const builder = imageUrlBuilder(client);

function urlFor(source, width = 800) {
  return builder.image(source).width(width).url();
}

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedTags, setUpdatedTags] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const galleryRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      const query = `*[_type == "imageAsset"]{_id, title, tags, category, image}`;
      const result = await client.fetch(query);
      setImages(result);
    };

    fetchImages();
  }, []);

  useEffect(() => {
    gsap.fromTo(
      galleryRef.current?.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.2 }
    );
  }, [images]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await client.delete(id);
      setImages(images.filter((img) => img._id !== id));
    }
  };

  const handleEdit = async (id) => {
    await client
      .patch(id)
      .set({
        title: updatedTitle,
        tags: updatedTags.split(",").map((tag) => tag.trim()),
        category: updatedCategory,
      })
      .commit();

    alert("Image updated!");
    setEditing(null);
    window.location.reload();
  };

  const handleDownload = (imageUrl, title) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = title || "downloaded_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleSendBulkWhatsApp = () => {
    const selectedImgs = images.filter((img) => selectedImages.includes(img._id));
    if (selectedImgs.length === 0) return alert("No images selected!");

    const message = `Sending you selected images!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const categorizedImages = images.reduce((acc, img) => {
    acc[img.category] = acc[img.category] || [];
    acc[img.category].push(img);
    return acc;
  }, {});

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="text"
          placeholder="Search images..."
          className="w-full p-3 border rounded-lg shadow-md text-black focus:ring-2 focus:ring-red-500 focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => setSearchQuery(searchQuery)}
          className="bg-red-500 text-white px-5 py-3 rounded-lg shadow hover:bg-red-600 transition"
        >
          Search
        </button>
      </div>

      {/* Send Bulk Button */}
      <button
        onClick={handleSendBulkWhatsApp}
        className="mb-5 bg-green-500 text-white px-5 py-3 rounded-lg shadow hover:bg-green-600 transition"
      >
        Send Selected Images 📤
      </button>

      {/* Image Folders */}
      <div className="space-y-6">
        {Object.entries(categorizedImages).map(([category, imgs]) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-black">{category}</h2>
            <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imgs.map((img) => (
                <div
                  key={img._id}
                  className={`relative p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-all ${
                    selectedImages.includes(img._id) ? "border-4 border-green-500" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    className="absolute top-2 left-2 w-5 h-5"
                    checked={selectedImages.includes(img._id)}
                    onChange={() => handleSelectImage(img._id)}
                  />

                  <img
                    src={urlFor(img.image)}
                    alt={img.title}
                    className="rounded-lg w-full h-64 object-cover cursor-pointer hover:scale-105 transition"
                  />
                  {editing === img._id ? (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="New Title"
                        defaultValue={img.title}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full p-2 border rounded mt-2"
                        placeholder="New Tags (comma separated)"
                        defaultValue={img.tags ? img.tags.join(", ") : ""}
                        onChange={(e) => setUpdatedTags(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full p-2 border rounded mt-2"
                        placeholder="New Category"
                        defaultValue={img.category}
                        onChange={(e) => setUpdatedCategory(e.target.value)}
                      />
                      <button
                        onClick={() => handleEdit(img._id)}
                        className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-black mt-2">{img.title}</h3>
                      <p className="text-sm text-black">Tags: {img.tags ? img.tags.join(", ") : "No Tags"}</p>
                      <div className="flex mt-3 space-x-2">
                        <button
                          onClick={() => setEditing(img._id)}
                          className="w-1/4 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(img._id)}
                          className="w-1/4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleDownload(urlFor(img.image, 1000), img.title)}
                          className="w-1/4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/?text=${urlFor(img.image)}`, "_blank")}
                          className="w-1/4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                          Send 📤
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
