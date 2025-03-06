import ImageUploader from "../components/ImageUploader";
import ImageGallery from "../components/ImageGallery";
import Header from "@/components/Header";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Header />
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
