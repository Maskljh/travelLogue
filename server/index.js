const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 模拟数据库数据
const travelogues = [
  {
    id: 1,
    imglist:[
      '/images/js.jpg',
      '/images/R-C.jpg'
    ],
    avatar: '/images/js.jpg',
    title: '江苏无锡三天两晚旅游攻略',
    desc: '抓紧收藏！江苏无锡三天两晚旅游攻略来了',
    author: '小吴要干饭o',
    views: 2293,
    // 0:待审核、1:已通过、2:未通过
    status: 1,
    reason:''
  },
  {
    id: 2,
    imglist:[
      '/images/js.jpg',
      '/images/R-C.jpg'
    ],
    avatar: '/images/js.jpg',
    title: '无锡近期热门景点榜',
    desc: '跟着热点去旅行',
    author: '旅游研究所',
    views: 881,
    status: 2,
    reason:'违反规定'
  },
  {
    id: 3,
    imglist:[
      '/images/js.jpg',
      '/images/R-C.jpg'
    ],
    avatar: '/images/js.jpg',
    title: '无锡鼋头渚 | 樱花开了',
    desc: '最美赏樱地。',
    author: '旅游研究所',
    views: 881,
    status: 1,
    reason:''
  },
  {
    id: 4,
    imglist:[
      '/images/js.jpg',
      '/images/R-C.jpg'
    ],
    avatar: '/images/js.jpg',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1,
    reason:''
  },
  {
    id: 5,
    imglist:[
      '/images/js.jpg',
      '/images/R-C.jpg'
    ],
    avatar: '/images/js.jpg',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1,
    reason:''
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

// 删除游记
app.delete('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: '游记不存在' });
  }

  // 从数组中删除该游记
  travelogues.splice(index, 1);
  
  res.json({ message: '删除成功' });
});

// 更新游记
app.put('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: '游记不存在' });
  }

  // 更新游记信息
  travelogues[index] = {
    ...travelogues[index],
    title: req.body.title,
    desc: req.body.desc,
    imglist: req.body.imglist,
    status : 0
  };
  
  res.json({ message: '更新成功', data: travelogues[index] });
});

// 创建新游记
app.post('/api/travelogues', (req, res) => {
  const { title, desc, imglist } = req.body;
  
  // 生成新ID (当前最大ID + 1)
  const newId = Math.max(...travelogues.map(t => t.id)) + 1;
  
  // 创建新游记对象
  const newTravelogue = {
    id: newId,
    imglist: imglist || [],
    avatar: imglist && imglist.length > 0 ? imglist[0] : '/images/js.jpg',
    title,
    desc,
    author: '当前用户', // 这里可以根据实际需求设置作者信息
    views: 0,
    status: 0, // 新创建的游记默认状态为待审核
    reason: ''
  };

  // 添加到游记列表
  travelogues.push(newTravelogue);
  
  res.status(201).json({ 
    message: '创建成功', 
    data: newTravelogue 
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 