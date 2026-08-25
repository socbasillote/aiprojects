import { useRef } from "react";

import { useDispatch } from "react-redux";

import { Button } from "../ui/button";

import { addImageElement } from "../../features/editor/editorSlice";

export default function ImageUploadButton() {
  const dispatch = useDispatch();

  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      const maxWidth = 300;
      const maxHeight = 250;

      const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height,
        1,
      );

      dispatch(
        addImageElement({
          src: objectUrl,
          width: image.width * scale,
          height: image.height * scale,
        }),
      );
    };

    image.src = objectUrl;

    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <Button variant="outline" size="sm" onClick={handleClick}>
        Image
      </Button>
    </>
  );
}
