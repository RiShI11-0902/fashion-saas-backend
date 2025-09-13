const { GoogleGenAI } = require("@google/genai");
const prisma = require("../utils/prisma-client");

const generateImage = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);

    if (user.allowedGenerate == 0) {
      return res.status(400).json({ message: "Limit Exceeded" });
    }

    const { prompt } = req.body;
    let base64Image = null;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (req.file) {
      base64Image = req.file.buffer.toString("base64"); // convert to base64
    }

    const contents = [{ text: prompt }];
    if (base64Image) {
      contents.push({
        inlineData: {
          mimeType: req.file.mimetype, // auto-detect from upload
          data: base64Image,
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: `${process.env.GEMINI_API_KEY}`,
    });

    // Call Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents,
      config: {
        responseModalities: ["IMAGE"], // ✅ ask for image explicitly
      },
    });

    // Extract generated image(s)
    const parts = response.candidates?.[0]?.content?.parts || [];
    let generatedImages = [];

    for (const part of parts) {
      if (part.inlineData) {
        generatedImages.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }

    if (generatedImages.length === 0) {
      return res.status(500).json({ error: "No image generated" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { allowedGenerate: { decrement: 1 } },
    });

    return res.status(200).json({
      success: true,
      images: generatedImages, // Array of base64 images
    });
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
};

module.exports = { generateImage };

// const ai = new GoogleGenAI({
//   vertexai: true,
//   project: "shopmonk",  // 🔹 replace with your project ID
//   location: "us-central1",
// });

// const model = "gemini-2.5-flash-image-preview";

// const generationConfig = {
//   maxOutputTokens: 32768,
//   temperature: 1,
//   topP: 0.95,
//   responseModalities: ["TEXT", "IMAGE"],
//   safetySettings: [
//     { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
//     { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
//     { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
//     { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
//   ],
// };

// const generateImage = async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     const file = req.file; // multer memory upload

//     if (!prompt || !file) {
//       return res.status(400).json({ error: "Prompt and image are required" });
//     }

//     // Convert image to base64 (already in memory buffer)
//     const base64Image = file.buffer.toString("base64");

//     const reqData = {
//       model,
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: prompt },
//             {
//               inlineData: {
//                 mimeType: file.mimetype,
//                 data: base64Image,
//               },
//             },
//           ],
//         },
//       ],
//       config: generationConfig,
//     };

//     const response = await ai.models.generateContent(reqData);

//     const imagePart = response.candidates?.[0]?.content?.parts?.find(
//       (p) => p.inlineData && p.inlineData.mimeType?.startsWith("image/")
//     );

//     if (!imagePart) {
//       return res.status(500).json({ error: "No image generated" });
//     }

//     const imageBase64 = imagePart.inlineData.data;
//     const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imageBase64}`;

//     res.json({ image: imageUrl });
//   } catch (err) {
//     console.error("Error generating image:", err);
//     res.status(500).json({ error: "Image generation failed", details: err.message });
//   }
// };

// module.exports = {generateImage}
