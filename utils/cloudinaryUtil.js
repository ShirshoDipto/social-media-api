const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadImage = (fileStream, name) => {
  const result = new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: name }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(fileStream);
  });

  return result;
};

exports.deleteImage = (fullurl) => {
  const result = new Promise((resolve, reject) => {
    const urlArray = fullurl.split("/");
    const publicId = urlArray[urlArray.length - 1].split(".")[0];
    cloudinary.uploader.destroy(publicId, function (res) {
      resolve(res);
    });
  });

  return result;
};

exports.getResizedAndOptimized = (imageName, w, h) => {
  const urlArray = imageName.split("/");
  urlArray.splice(urlArray.length - 2, 0, `c_fill,w_${w},h_${h},f_auto,q_auto`);
  const newImageUrl = urlArray.join("/");
  return newImageUrl;
  // return cloudinary.url(imageName, {
  //   width: "300",
  //   height: "300",
  //   crop: "fill",
  //   quality: "auto",
  // });
};

exports.getOptimized = (imageName) => {
  const urlArray = imageName.split("/");
  urlArray.splice(urlArray.length - 2, 0, "w_1000/f_auto,q_auto");
  const newImageUrl = urlArray.join("/");
  return newImageUrl;
};
