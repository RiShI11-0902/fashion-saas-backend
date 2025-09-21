const { GoogleGenAI } = require("@google/genai");
const prisma = require("../utils/prisma-client");

const generateImage = async (req, res) => {
  try {
    const user = req.user;
    if (user.allowedGenerate == 0) {
      return res.status(400).json({ message: "Limit exceeded subscribe to generate More" });
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