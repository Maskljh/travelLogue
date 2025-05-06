const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 模拟数据库数据
const travelogues = [
  {
    id: 1,
    imglist:[
      '../../images/js.jpg',
      '../../images/R-C.jpg'
    ],
    avatar: '../../images/js.jpg',
    title: '江苏无锡三天两晚旅游攻略',
    desc: '抓紧收藏！江苏无锡三天两晚旅游攻略来了',
    author: '小吴要干饭o',
    views: 2293,
    // 0:待审核、1:已通过、2:未通过
    status: 1
  },
  {
    id: 2,
    imglist:[
      '../../images/js.jpg',
      '../../images/R-C.jpg'
    ],
    avatar: '../../images/js.jpg',
    title: '无锡近期热门景点榜',
    desc: '跟着热点去旅行',
    author: '旅游研究所',
    views: 881,
    status: 2
  },
  {
    id: 3,
    imglist:[
      '../../images/js.jpg',
      '../../images/R-C.jpg'
    ],
    avatar: '../../images/js.jpg',
    title: '无锡鼋头渚 | 樱花开了',
    desc: '最美赏樱地。',
    author: '旅游研究所',
    views: 881,
    status: 1
  },
  {
    id: 4,
    imglist:[
      '../../images/js.jpg',
      '../../images/R-C.jpg'
    ],
    avatar: '../../images/js.jpg',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1
  },
  {
    id: 5,
    img: '../../images/js.jpg',
    imglist:[
      '../../images/js.jpg',
      '../../images/R-C.jpg'
    ],
    avatar: '../../images/js.jpg',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1
  }
];

// 获取所有游记
app.get('/api/travelogues', (req, res) => {
  res.json(travelogues);
});

// 获取单个游记
app.get('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const travelogue = travelogues.find(t => t.id === id);
  if (travelogue) {
    res.json(travelogue);
  } else {
    res.status(404).json({ message: '游记不存在' });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 