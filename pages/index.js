import ImageUploader from "../components/ImageUploader";
import ImageGallery from "../components/ImageGallery";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
