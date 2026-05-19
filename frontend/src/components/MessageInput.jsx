import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [rawImages, setRawImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    const reader = new FileReader();
    setRawImages([...rawImages, file]);
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagesPreview([...imagesPreview, reader.result]);
    };
  };

  const removeImage = (index) => {
    const newImages = [...rawImages];
    const newPreviews = [...imagesPreview];

    newPreviews.splice(index, 1);
    setImagesPreview(newPreviews);
    
    newImages.splice(index, 1);
    setRawImages(newImages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && imagesPreview.length === 0) return;

    try {
      await sendMessage({
        text: text.trim(),
        rawImages: rawImages,
      });

      // Clear form
      setText("");
      setImagesPreview([]);
      setRawImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagesPreview.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          {imagesPreview.map((imagePreview, index) => (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={uploadImage}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagesPreview.length > 0 ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && imagesPreview.length === 0}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
