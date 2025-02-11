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
  const [selectedImage, setSelectedImage] = useState(null);
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

  const handleSearch = () => {
    setSearchQuery(searchQuery);
  };

  const handleDownload = (imageUrl, title) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = title || "downloaded_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleWhatsAppShare = (img) => {
    const message = `Check out this image: ${img.title} - ${urlFor(img.image)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.tags &&
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      img.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          onClick={handleSearch}
          className="bg-red-500 text-white px-5 py-3 rounded-lg shadow hover:bg-red-600 transition"
        >
          Search
        </button>
      </div>

      {/* Image Gallery */}
      <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div
              key={img._id}
              className="relative p-4 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-all"
            >
              <img
                src={urlFor(img.image)}
                alt={img.title}
                className="rounded-lg w-full h-64 object-cover cursor-pointer hover:scale-105 transition"
                onClick={() => setSelectedImage(urlFor(img.image, 1000))}
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
                  <p className="text-sm text-black">Category: {img.category}</p>
                  <p className="text-sm text-black">Tags: {img.tags ? img.tags.join(", ") : "No Tags"}</p>
                  <div className="flex mt-3 space-x-2">
                    <button
                      onClick={() => setEditing(img._id)}
                      className="w-1/3 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="w-1/3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleDownload(urlFor(img.image, 1000), img.title)}
                      className="w-1/3 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleWhatsAppShare(img)}
                      className="w-1/3 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Send 📤
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No images found</p>
        )}
      </div>

      {/* Full-Screen Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-lg" alt="Full Preview" />
          <button
            className="absolute top-5 right-5 bg-white text-black px-4 py-2 rounded-full text-xl shadow-lg"
            onClick={() => setSelectedImage(null)}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
