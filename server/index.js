const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { generateToken, authMiddleware } = require("./auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

// 指定上传目录
const DESKTOP_PATH = "C:\\Users\\17870\\Desktop";
const IMAGE_DIR = path.join(DESKTOP_PATH, "image");
const VIDEO_DIR = path.join(DESKTOP_PATH, "video");

// 确保目录存在
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型选择不同的存储目录
    const uploadDir = file.mimetype.startsWith("image/")
      ? IMAGE_DIR
      : VIDEO_DIR;
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 限制50MB，视频文件通常较大
  },
  fileFilter: function (req, file, cb) {
    // 允许图片和视频文件
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("只允许上传图片或视频文件！"), false);
    }
  },
});

// 启用CORS
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000", // 前端应用地址
    credentials: true, // 允许携带凭证
  })
);
app.use(express.json());
app.use(cookieParser());

// 静态文件服务
app.use("/uploads", express.static(DESKTOP_PATH));

// 审核id（reviewID），游记id（travelID），作者id（authorID），作者昵称（authorName），游记标题（travelTitle），状态（status 默认为"未审核"），已删除（isdeleted 默认为"false"）

// 模拟数据库数据
const travelogues = [
  {
    // 游记id
    id: 1,
    // 视频
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    // 游记照片
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    // 用户id
    authorID: "asss",
    // 用户头像
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    // 游记标题
    title: "江苏无锡三天两晚旅游攻略",
    // 游记描述
    desc: "抓紧收藏！江苏无锡三天两晚旅游攻略来了",
    // 用户昵称
    author: "小吴要干饭o",
    // 看的数量
    views: 2293,
    // 0:待审核、1:已通过、2:未通过
    status: 1,
    // 未通过原因
    reason: "",
    // 是否删除
    isdeleted: false,
    // 时间
    time: "2025-05-01 19:02:03",
  },
  {
    id: 2,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "bsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "无锡近期热门景点榜",
    desc: "跟着热点去旅行",
    author: "旅游研究所",
    views: 881,
    status: 2,
    reason: "违反规定",
    isdeleted: false,
    time: "2025-05-01 19:02:04",
  },
  {
    id: 3,
    video: null,
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "bsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "无锡鼋头渚 | 樱花开了",
    desc: "最美赏樱地。",
    author: "旅游研究所",
    views: 881,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:05",
  },
  {
    id: 4,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "csss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "在无锡！好吃不贵的本帮菜馆",
    desc: "挤爆了~",
    author: "强哥",
    views: 114,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:06",
  },
  {
    id: 5,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "csss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "在无锡！好吃不贵的本帮菜馆",
    desc: "挤爆了~",
    author: "强哥",
    views: 114,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:07",
  },
  {
    // 游记id
    id: 6,
    // 视频
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    // 游记照片
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    // 用户id
    authorID: "dsss",
    // 用户头像
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    // 游记标题
    title: "西藏自驾游旅游攻略",
    // 游记描述
    desc: "抓紧收藏！西藏自驾游旅游攻略来了",
    // 用户昵称
    author: "小悠想睡觉o",
    // 看的数量
    views: 0,
    // 0:待审核、1:已通过、2:未通过
    status: 1,
    // 未通过原因
    reason: "",
    // 是否删除
    isdeleted: false,
    time: "2025-05-01 19:02:08",
  },
  {
    id: 7,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "esss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "杭州西湖一日游攻略",
    desc: "西湖美景让人流连忘返",
    author: "旅行达人",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:09",
  },
  {
    id: 8,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "fsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "上海外滩夜景打卡",
    desc: "魔都夜景太美了",
    author: "城市探索者",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:10",
  },
  {
    id: 9,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "gsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "北京故宫博物院游览指南",
    desc: "感受历史的厚重",
    author: "文化探索者",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:11",
  },
  {
    id: 10,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "hsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "广州美食地图",
    desc: "舌尖上的广州",
    author: "美食家",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:12",
  },
  {
    id: 11,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "isss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "深圳湾公园漫步",
    desc: "现代都市中的自然风光",
    author: "城市漫步者",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:13",
  },
  {
    id: 12,
    video: "https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4",
    imglist: [
      "https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0",
      "https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7",
    ],
    authorID: "jsss",
    avatar:
      "https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient",
    title: "成都宽窄巷子游记",
    desc: "感受老成都的悠闲生活",
    author: "慢生活家",
    views: 0,
    status: 1,
    reason: "",
    isdeleted: false,
    time: "2025-05-01 19:02:14",
  },
];

// 模拟审核员数据
const admins = [
  {
    id: "1",
    adminid: "AD001",
    adminname: "审核员1号",
    password: "123456",
    role: "审核人员",
  },
  {
    id: "2",
    adminid: "AD002",
    adminname: "审核员2号",
    password: "123456",
    role: "审核人员",
  },
  {
    id: "3",
    adminid: "AD003",
    adminname: "管理员1号",
    password: "123456",
    role: "管理员",
  },
];

// 获取所有游记
app.get("/api/travelogues", (req, res) => {
  const { page, pageSize } = req.query;
  // 过滤掉已删除的游记
  const activeTravelogues = travelogues.filter((t) => !t.isdeleted);
  // 按时间逆序排序
  activeTravelogues.sort((a, b) => {
    return new Date(b.time) - new Date(a.time);
  });

  // 如果传入了 page 参数，则进行分页
  if (page) {
    // const pageSize = 10; // 每页显示10条数据
    const startIndex = (page - 1) * pageSize; // 前面的不显示
    const endIndex = startIndex + pageSize; // 后面的不显示
    const currentPageTravelogues = activeTravelogues.slice(
      startIndex,
      endIndex
    );
    res.json({ total: activeTravelogues.length, data: currentPageTravelogues });
  } else {
    res.json(activeTravelogues);
  }
});

// 根据搜索条件获取游记列表
// 放在它前面 /api/travelogues/:id
app.get("/api/travelogues/search", (req, res) => {
  const {
    status,
    reviewID,
    travelID,
    authorID,
    authorName,
    travelTitle,
    page,
  } = req.query;

  // 过滤掉已删除的游记
  let filteredTravelogues = travelogues.filter((t) => !t.isdeleted);

  // 应用搜索条件
  if (status) {
    const statusValues = Array.isArray(status) ? status : [status];
    filteredTravelogues = filteredTravelogues.filter((t) => {
      const statusText =
        t.status === 0 ? "待审核" : t.status === 1 ? "已通过" : "未通过";
      return statusValues.includes(statusText);
    });
  }

  if (reviewID) {
    filteredTravelogues = filteredTravelogues.filter((t) =>
      t.id.toString().includes(reviewID)
    );
  }

  if (travelID) {
    filteredTravelogues = filteredTravelogues.filter((t) =>
      t.id.toString().includes(travelID)
    );
  }

  if (authorID) {
    filteredTravelogues = filteredTravelogues.filter((t) =>
      t.authorID.toLowerCase().includes(authorID.toLowerCase())
    );
  }

  if (authorName) {
    filteredTravelogues = filteredTravelogues.filter((t) =>
      t.author.toLowerCase().includes(authorName.toLowerCase())
    );
  }

  if (travelTitle) {
    filteredTravelogues = filteredTravelogues.filter((t) =>
      t.title.toLowerCase().includes(travelTitle.toLowerCase())
    );
  }

  // 按时间逆序排序
  filteredTravelogues.sort((a, b) => {
    return new Date(b.time) - new Date(a.time);
  });

  const pageSize = 10; // 每页显示10条数据
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageTravelogues = filteredTravelogues.slice(
    startIndex,
    endIndex
  );

  res.json({
    total: filteredTravelogues.length,
    data: currentPageTravelogues,
  });
});

// 获取单个游记   id是游记id
app.get("/api/travelogues/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const travelogue = travelogues.find((t) => t.id === id);
  if (travelogue) {
    res.json(travelogue);
  } else {
    res.status(404).json({ message: "游记不存在" });
  }
});

// 删除游记  游记id
app.delete("/api/travelogues/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "游记不存在" });
  }

  // 将游记标记为已删除
  travelogues[index].isdeleted = true;

  res.json({ message: "删除成功" });
});

// 更新游记    地址需要加游记Id     req需要包括title,desc,imagelist
app.put("/api/travelogues/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "游记不存在" });
  }

  const { title, desc, imglist, video } = req.body;

  // 验证必填字段
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "标题不能为空" });
  }

  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: "描述不能为空" });
  }

  if (!imglist || imglist.length === 0) {
    return res.status(400).json({ message: "至少需要上传一张图片" });
  }

  // 更新游记信息
  travelogues[index] = {
    ...travelogues[index],
    title: req.body.title,
    desc: req.body.desc,
    imglist: req.body.imglist,
    status: 0,
    isdeleted: false,
    video,
  };

  res.json({ message: "更新成功", data: travelogues[index] });
});

// 创建新游记     req需要title, desc, imglist, authorID, avatar, author
app.post("/api/travelogues", (req, res) => {
  const {
    title,
    desc,
    imglist,
    authorID,
    avatar,
    author,
    time,
    video,
    reason,
  } = req.body;

  // 验证必填字段
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "标题不能为空" });
  }

  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: "描述不能为空" });
  }

  if (!imglist || imglist.length === 0) {
    return res.status(400).json({ message: "至少需要上传一张图片" });
  }

  if (!authorID) {
    return res.status(400).json({ message: "作者ID不能为空" });
  }

  // 生成新ID (当前最大ID + 1)
  const newId = Math.max(...travelogues.map((t) => t.id)) + 1;

  // 创建新游记对象
  const newTravelogue = {
    id: newId,
    imglist: imglist || [],
    authorID,
    avatar,
    title,
    desc,
    author,
    views: 0,
    status: 0, // 新创建的游记默认状态为待审核
    reason: "",
    isdeleted: false,
    time,
    video,
    reason,
  };

  // 添加到游记列表
  travelogues.push(newTravelogue);

  res.status(201).json({
    message: "创建成功",
    data: newTravelogue,
  });
});

// 获取用户的所有游记
app.get("/api/travelogues/user/:openid", (req, res) => {
  const openid = req.params.openid;

  if (!openid) {
    return res.status(400).json({ message: "缺少openid参数" });
  }

  // 根据openid筛选游记
  const userTravelogues = travelogues.filter((t) => t.authorID === openid);

  res.json(userTravelogues);
});

// 添加图片路由
app.get("/api/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "..", "images", filename);

  // 检查文件是否存在
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({
      error: "Image not found",
      path: imagePath,
      filename: filename,
    });
  }
});

// 更新游记状态（通过或拒绝通过）
app.put("/api/travelogues/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status, reason } = req.body;
  const index = travelogues.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "游记不存在" });
  }

  // 验证状态值
  if (status !== 1 && status !== 2) {
    return res.status(400).json({ message: "无效的状态值" });
  }

  // 如果是拒绝（status === 2），必须提供原因
  if (status === 2 && (!reason || !reason.trim())) {
    return res.status(400).json({ message: "拒绝时必须提供原因" });
  }

  // 更新游记状态
  travelogues[index] = {
    ...travelogues[index],
    status: status,
    reason: status === 2 ? reason : "", // 如果是拒绝，保存原因；如果是通过，清空原因
  };

  res.json({
    message: status === 1 ? "已通过" : "已拒绝",
    data: travelogues[index],
  });
});

// 伪删除游记
app.put("/api/travelogues/:id/delete", (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "游记不存在" });
  }

  // 更新游记的删除状态
  travelogues[index] = {
    ...travelogues[index],
    isdeleted: true,
  };

  res.json({
    message: "删除成功",
    data: travelogues[index],
  });
});

// 管理员登录
app.post("/api/admin/login", (req, res) => {
  const { adminname, password } = req.body;

  // 在审核员数据中查找匹配的用户
  const admin = admins.find(
    (a) => a.adminname === adminname && a.password === password
  );

  if (admin) {
    const adminInfo = {
      adminid: admin.adminid,
      adminname: admin.adminname,
      role: admin.role,
    };

    // 生成 token
    const token = generateToken(adminInfo);

    // 设置 cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24小时
    });

    res.json({
      isAuthenticated: true,
      adminInfo,
    });
  } else {
    res.status(401).json({ message: "用户名或密码错误" });
  }
});

// 管理员登出
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.json({ message: "登出成功" });
});

// 检查管理员登录状态
app.get("/api/admin/status", authMiddleware, (req, res) => {
  res.json({
    isAuthenticated: true,
    adminInfo: req.adminInfo,
  });
});

// 添加文件上传接口
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "没有上传文件" });
  }

  // 返回文件的访问URL
  const fileUrl = `http://localhost:${port}/uploads/${path.basename(
    req.file.destination
  )}/${req.file.filename}`;
  res.json({
    message: "上传成功",
    url: fileUrl,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
