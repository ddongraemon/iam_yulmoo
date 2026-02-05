// 로컬 테스트용. Vercel 배포 함수 수 제한(12개) 때문에 api/ 에 두지 않음.
module.exports = function (req, res) {
  res.status(200).json({
    message: "Test API is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
