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
const DESKTOP_PATH = "C:\\Users\\l\\Desktop";
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
    origin: true, // 允许所有来源
    credentials: true, // 允许携带凭证
  })
);
app.use(express.json());
app.use(cookieParser());

// 静态文件服务
app.use("/uploads", express.static(DESKTOP_PATH));

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'travel'
});
connection.connect();

app.get("/api/travelogues", (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 10;
  let sql = "SELECT * FROM travelogues WHERE isdeleted = 0 ORDER BY time DESC";
  let params = [];
  if (page) {
    const offset = (page - 1) * pageSize;
    sql += " LIMIT ?, ?";
    params.push(offset, pageSize);
  }
  const countSql = 'SELECT COUNT(*) as total FROM travelogues WHERE isdeleted = 0';
  // 先查总数，再查数据（或并发）
  connection.query(countSql, (err2, countResult) => {
    if (err2) {
      console.error("Count Error:", err2);
      return res.status(500).json({ message: "统计错误", error: err2 });
    }

    const total = countResult[0].total;

    // 再查分页数据
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error("Query Error:", err);
        return res.status(500).json({ message: "查询错误", error: err });
      }

      res.json({
        total,      // ✅ 正确的总数（基于筛选条件）
        data: results
      });
    });
  });
});

// // 获取所有游记
// app.get("/api/travelogues", (req, res) => {
//   const { page } = req.query;
//   // 过滤掉已删除的游记
//   const activeTravelogues = travelogues.filter((t) => !t.isdeleted);

//   // 如果传入了 page 参数，则进行分页
//   if (page) {
//     // 按时间逆序排序
//     activeTravelogues.sort((a, b) => {
//       return new Date(b.time) - new Date(a.time);
//     });
//     const pageSize = 10; // 每页显示10条数据
//     const startIndex = (page - 1) * pageSize; // 前面的不显示
//     const endIndex = startIndex + pageSize; // 后面的不显示
//     const currentPageTravelogues = activeTravelogues.slice(
//       startIndex,
//       endIndex
//     );
//     res.json({ total: activeTravelogues.length, data: currentPageTravelogues });
//   } else {
//     res.json(activeTravelogues);
//   }
// });

// // 根据搜索条件获取游记列表
// // 放在它前面 /api/travelogues/:id
// app.get("/api/travelogues/search", (req, res) => {
//   const {
//     status,
//     reviewID,
//     travelID,
//     authorID,
//     authorName,
//     travelTitle,
//     page,
//   } = req.query;

//   // 过滤掉已删除的游记
//   let filteredTravelogues = travelogues.filter((t) => !t.isdeleted);

//   // 应用搜索条件
//   if (status) {
//     const statusValues = Array.isArray(status) ? status : [status];
//     filteredTravelogues = filteredTravelogues.filter((t) => {
//       const statusText =
//         t.status === 0 ? "待审核" : t.status === 1 ? "已通过" : "未通过";
//       return statusValues.includes(statusText);
//     });
//   }

//   if (reviewID) {
//     filteredTravelogues = filteredTravelogues.filter((t) =>
//       t.id.toString().includes(reviewID)
//     );
//   }

//   if (travelID) {
//     filteredTravelogues = filteredTravelogues.filter((t) =>
//       t.id.toString().includes(travelID)
//     );
//   }

//   if (authorID) {
//     filteredTravelogues = filteredTravelogues.filter((t) =>
//       t.authorID.toLowerCase().includes(authorID.toLowerCase())
//     );
//   }

//   if (authorName) {
//     filteredTravelogues = filteredTravelogues.filter((t) =>
//       t.author.toLowerCase().includes(authorName.toLowerCase())
//     );
//   }

//   if (travelTitle) {
//     filteredTravelogues = filteredTravelogues.filter((t) =>
//       t.title.toLowerCase().includes(travelTitle.toLowerCase())
//     );
//   }

//   // 按时间逆序排序
//   filteredTravelogues.sort((a, b) => {
//     return new Date(b.time) - new Date(a.time);
//   });

//   const pageSize = 10; // 每页显示10条数据
//   const startIndex = (page - 1) * pageSize;
//   const endIndex = startIndex + pageSize;
//   const currentPageTravelogues = filteredTravelogues.slice(
//     startIndex,
//     endIndex
//   );

//   res.json({
//     total: filteredTravelogues.length,
//     data: currentPageTravelogues,
//   });
// });

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

  let sql = "SELECT * FROM travelogues WHERE isdeleted = 0";
  let params = [];

  if (status) {
    // status: 0=待审核, 1=已通过, 2=未通过
    sql += " AND status = ?";
    params.push(status);
  }
  if (reviewID) {
    sql += " AND id LIKE ?";
    params.push(`%${reviewID}%`);
  }
  if (travelID) {
    sql += " AND id LIKE ?";
    params.push(`%${travelID}%`);
  }
  if (authorID) {
    sql += " AND authorID LIKE ?";
    params.push(`%${authorID}%`);
  }
  if (authorName) {
    sql += " AND author LIKE ?";
    params.push(`%${authorName}%`);
  }
  if (travelTitle) {
    sql += " AND title LIKE ?";
    params.push(`%${travelTitle}%`);
  }

  sql += " ORDER BY time DESC";

  const pageSize = 10;
  if (page) {
    const offset = (page - 1) * pageSize;
    sql += " LIMIT ?, ?";
    params.push(offset, pageSize);
  }

  connection.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "数据库错误", error: err });
    // 查询总数
    let countSql = "SELECT COUNT(*) as total FROM travelogues WHERE isdeleted = 0";
    let countParams = [];
    // 这里可以复用上面的条件拼接
    if (status) {
      countSql += " AND status = ?";
      countParams.push(status);
    }
    if (reviewID) {
      countSql += " AND id LIKE ?";
      countParams.push(`%${reviewID}%`);
    }
    if (travelID) {
      countSql += " AND id LIKE ?";
      countParams.push(`%${travelID}%`);
    }
    if (authorID) {
      countSql += " AND authorID LIKE ?";
      countParams.push(`%${authorID}%`);
    }
    if (authorName) {
      countSql += " AND author LIKE ?";
      countParams.push(`%${authorName}%`);
    }
    if (travelTitle) {
      countSql += " AND title LIKE ?";
      countParams.push(`%${travelTitle}%`);
    }
    connection.query(countSql, countParams, (err2, countResult) => {
      if (err2) return res.status(500).json({ message: "数据库错误", error: err2 });
      res.json({ total: countResult[0].total, data: results });
    });
  });
});

// // 获取单个游记   id是游记id
// app.get("/api/travelogues/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const travelogue = travelogues.find((t) => t.id === id);
//   if (travelogue) {
//     res.json(travelogue);
//   } else {
//     res.status(404).json({ message: "游记不存在" });
//   }
// });

app.get("/api/travelogues/:id", (req, res) => {
  const id = parseInt(req.params.id);
  connection.query("SELECT * FROM travelogues WHERE id = ? AND isdeleted = 0", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "数据库错误", error: err });
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: "游记不存在" });
    }
  });
});

// // 删除游记  游记id
// app.delete("/api/travelogues/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = travelogues.findIndex((t) => t.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "游记不存在" });
//   }

//   // 将游记标记为已删除
//   travelogues[index].isdeleted = true;

//   res.json({ message: "删除成功" });
// });

app.delete("/api/travelogues/:id/delete", (req, res) => {
  const id = parseInt(req.params.id);
  connection.query("UPDATE travelogues SET isdeleted = 1 WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "数据库错误", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "游记不存在" });
    }
    res.json({ message: "删除成功" });
  });
});

// // 更新游记    地址需要加游记Id     req需要包括title,desc,imagelist
// app.put("/api/travelogues/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = travelogues.findIndex((t) => t.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "游记不存在" });
//   }

//   const { title, desc, imglist, video } = req.body;

//   // 验证必填字段
//   if (!title || !title.trim()) {
//     return res.status(400).json({ message: "标题不能为空" });
//   }

//   if (!desc || !desc.trim()) {
//     return res.status(400).json({ message: "描述不能为空" });
//   }

//   if (!imglist || imglist.length === 0) {
//     return res.status(400).json({ message: "至少需要上传一张图片" });
//   }

//   // 更新游记信息
//   travelogues[index] = {
//     ...travelogues[index],
//     title: req.body.title,
//     desc: req.body.desc,
//     imglist: req.body.imglist,
//     status: 0,
//     isdeleted: false,
//     video,
//   };

//   res.json({ message: "更新成功", data: travelogues[index] });
// });

app.put("/api/travelogues/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, desc, imglist, video } = req.body;
  console.log({ title, desc, imglist, video, id });

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "标题不能为空" });
  }
  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: "描述不能为空" });
  }
  if (!imglist || imglist.length === 0) {
    return res.status(400).json({ message: "至少需要上传一张图片" });
  }
  connection.query(
    "UPDATE travelogues SET title=?, `desc`=?, imglist=?, video=?, status=0, isdeleted=0 WHERE id=?",
    [title, desc, JSON.stringify(imglist), video, id],
    (err, result) => {
      if (err) {
        console.error('数据库错误:', err); // 建议加上这行，方便调试
        return res.status(500).json({ message: "数据库错误", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "游记不存在" });
      }
      res.json({ message: "更新成功" });
    }
  );
});

// // 创建新游记     req需要title, desc, imglist, authorID, avatar, author
// app.post("/api/travelogues", (req, res) => {
//   const {
//     title,
//     desc,
//     imglist,
//     authorID,
//     avatar,
//     author,
//     time,
//     video,
//     reason,
//   } = req.body;

//   // 验证必填字段
//   if (!title || !title.trim()) {
//     return res.status(400).json({ message: "标题不能为空" });
//   }

//   if (!desc || !desc.trim()) {
//     return res.status(400).json({ message: "描述不能为空" });
//   }

//   if (!imglist || imglist.length === 0) {
//     return res.status(400).json({ message: "至少需要上传一张图片" });
//   }

//   if (!authorID) {
//     return res.status(400).json({ message: "作者ID不能为空" });
//   }

//   // 生成新ID (当前最大ID + 1)
//   const newId = Math.max(...travelogues.map((t) => t.id)) + 1;

//   // 创建新游记对象
//   const newTravelogue = {
//     id: newId,
//     imglist: imglist || [],
//     authorID,
//     avatar,
//     title,
//     desc,
//     author,
//     views: 0,
//     status: 0, // 新创建的游记默认状态为待审核
//     reason: "",
//     isdeleted: false,
//     time,
//     video,
//     reason,
//   };

//   // 添加到游记列表
//   travelogues.push(newTravelogue);

//   res.status(201).json({
//     message: "创建成功",
//     data: newTravelogue,
//   });
// });

app.post("/api/travelogues", (req, res) => {
  const { title, desc, imglist, authorID, avatar, author, time, video, reason } = req.body;
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
  connection.query(
    "INSERT INTO travelogues (imglist, authorID, avatar, title, `desc`, author, views, status, reason, isdeleted, time, video) VALUES (?, ?, ?, ?, ?, ?, 0, 0, '', 0, ?, ?)",
    [JSON.stringify(imglist), authorID, avatar, title, desc, author, time, video],
    (err, result) => {
      if (err) return res.status(500).json({ message: "数据库错误", error: err });
      res.status(201).json({ message: "创建成功", id: result.insertId });
    }
  );
});

// // 获取用户的所有游记
// app.get("/api/travelogues/user/:openid", (req, res) => {
//   const openid = req.params.openid;

//   if (!openid) {
//     return res.status(400).json({ message: "缺少openid参数" });
//   }

//   // 根据openid筛选游记
//   const userTravelogues = travelogues.filter((t) => t.authorID === openid);

//   res.json(userTravelogues);
// });

app.get("/api/travelogues/user/:openid", (req, res) => {
  const openid = req.params.openid;
  if (!openid) {
    return res.status(400).json({ message: "缺少openid参数" });
  }
  connection.query("SELECT * FROM travelogues WHERE authorID = ? AND isdeleted = 0", [openid], (err, results) => {
    if (err) return res.status(500).json({ message: "数据库错误", error: err });
    res.json(results);
  });
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

// // 更新游记状态（通过或拒绝通过）
// app.put("/api/travelogues/:id/status", (req, res) => {
//   const id = parseInt(req.params.id);
//   const { status, reason } = req.body;
//   const index = travelogues.findIndex((t) => t.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "游记不存在" });
//   }

//   // 验证状态值
//   if (status !== 1 && status !== 2) {
//     return res.status(400).json({ message: "无效的状态值" });
//   }

//   // 如果是拒绝（status === 2），必须提供原因
//   if (status === 2 && (!reason || !reason.trim())) {
//     return res.status(400).json({ message: "拒绝时必须提供原因" });
//   }

//   // 更新游记状态
//   travelogues[index] = {
//     ...travelogues[index],
//     status: status,
//     reason: status === 2 ? reason : "", // 如果是拒绝，保存原因；如果是通过，清空原因
//   };

//   res.json({
//     message: status === 1 ? "已通过" : "已拒绝",
//     data: travelogues[index],
//   });
// });

app.put("/api/travelogues/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { status, reason } = req.body;
  if (status !== 1 && status !== 2) {
    return res.status(400).json({ message: "无效的状态值" });
  }
  if (status === 2 && (!reason || !reason.trim())) {
    return res.status(400).json({ message: "拒绝时必须提供原因" });
  }
  connection.query(
    "UPDATE travelogues SET status=?, reason=? WHERE id=?",
    [status, status === 2 ? reason : '', id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "数据库错误", error: err });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "游记不存在" });
      }
      res.json({ message: status === 1 ? "已通过" : "已拒绝" });
    }
  );
});

// // 伪删除游记
// app.put("/api/travelogues/:id/delete", (req, res) => {
//   const id = parseInt(req.params.id);
//   const index = travelogues.findIndex((t) => t.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "游记不存在" });
//   }

//   // 更新游记的删除状态
//   travelogues[index] = {
//     ...travelogues[index],
//     isdeleted: true,
//   };

//   res.json({
//     message: "删除成功",
//     data: travelogues[index],
//   });
// });

// // 在审核员数据中查找匹配的用户
// const admin = admins.find(
//   (a) => a.adminname === adminname && a.password === password
// );

// if (admin) {
//   const adminInfo = {
//     adminid: admin.adminid,
//     adminname: admin.adminname,
//     role: admin.role,
//   };

//   // 生成 token
//   const token = generateToken(adminInfo);

//   // 设置 cookie
//   res.cookie("adminToken", token, {
//     httpOnly: true,
//     // secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 24 * 60 * 60 * 1000, // 24小时
//   });

//   res.json({
//     isAuthenticated: true,
//     adminInfo,
//   });
// } else {
//   res.status(401).json({ message: "用户名或密码错误" });
// }

// 管理员登录
app.post("/api/admin/login", (req, res) => {
  const { adminname, password } = req.body;

  // 用MySQL查询管理员
  connection.query(
    "SELECT adminid, adminname, role FROM admins WHERE adminname = ? AND password = ?",
    [adminname, password],
    (err, results) => {
      if (err) {
        console.error('数据库错误:', err);
        return res.status(500).json({ message: "数据库错误", error: err });
      }
      if (results.length > 0) {
        const adminInfo = results[0];
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
    }
  );
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

app.listen(port, "localhost", () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
