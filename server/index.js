const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 审核id（reviewID），游记id（travelID），作者id（authorID），作者昵称（authorName），游记标题（travelTitle），状态（status 默认为"未审核"），已删除（isdeleted 默认为"false"）

// 模拟数据库数据
const travelogues = [
  {
    // 游记id
    id: 1,
    // 视频
    video:'https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4',
    // 游记照片
    imglist:[
      'https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0',
      'https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7'
    ],
    // 用户id
    authorID:'asss',
    // 用户头像
    avatar: 'https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient',
    // 游记标题
    title: '江苏无锡三天两晚旅游攻略',
    // 游记描述
    desc: '抓紧收藏！江苏无锡三天两晚旅游攻略来了',
    // 用户昵称
    author: '小吴要干饭o',
    // 看的数量
    views: 2293,
    // 0:待审核、1:已通过、2:未通过
    status: 1,
    // 未通过原因
    reason:'',
    // 是否删除
    isdeleted :false,
    // 时间
    time :'2025-05-01 19:02:03'
  },
  {
    id: 2,
    video:'https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4',
    imglist:[
      'https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0',
      'https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7'
    ],
    authorID:'bsss',
    avatar: 'https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient',
    title: '无锡近期热门景点榜',
    desc: '跟着热点去旅行',
    author: '旅游研究所',
    views: 881,
    status: 2,
    reason:'违反规定',
    isdeleted :false,
    time :'2025-05-01 19:02:03'
  },
  {
    id: 3,
    video:null,
    imglist:[
      'https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0',
      'https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7'
    ],
    authorID:'bsss',
    avatar: 'https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient',
    title: '无锡鼋头渚 | 樱花开了',
    desc: '最美赏樱地。',
    author: '旅游研究所',
    views: 881,
    status: 1,
    reason:'',
    isdeleted :false,
    time :'2025-05-01 19:02:03'
  },
  {
    id: 4,
    video:'https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4',
    imglist:[
      'https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0',
      'https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7'
    ],
    authorID:'csss',
    avatar: 'https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1,
    reason:'',
    isdeleted :false,
    time :'2025-05-01 19:02:03'
  },
  {
    id: 5,
    video:'https://cdn.pixabay.com/video/2025/04/09/270940_large.mp4',
    imglist:[
      'https://ts1.tc.mm.bing.net/th/id/R-C.694364eb1a65398351c3e529eff28242?rik=oCRYPRPiv7YqnQ&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd20210510ac%2f133%2fw2000h1333%2f20210510%2ff096-kpuunnc9067523.jpg&ehk=jgTCFsvwMEyrP%2bWdBHLnKKxrb54iZkNKR9783iB1qWo%3d&risl=&pid=ImgRaw&r=0',
      'https://tse2-mm.cn.bing.net/th/id/OIP-C.QaWJbuoHou3GxKSnxkHVywHaEK?w=364&h=180&c=7&r=0&o=5&pid=1.7'
    ],
    authorID:'csss',
    avatar: 'https://youimg1.c-ctrip.com/target/100k0e00000073dqv4D1C_D_10000_1200.jpg?proc=autoorient',
    title: '在无锡！好吃不贵的本帮菜馆',
    desc: '挤爆了~',
    author: '强哥',
    views: 114,
    status: 1,
    reason:'',
    isdeleted :false,
    time :'2025-05-01 19:02:03'
  }
];

// 获取所有游记
app.get('/api/travelogues', (req, res) => {
  res.json(travelogues);
});

// 获取单个游记   id是游记id
app.get('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const travelogue = travelogues.find(t => t.id === id);
  if (travelogue) {
    res.json(travelogue);
  } else {
    res.status(404).json({ message: '游记不存在' });
  }
});

// 删除游记  游记id
app.delete('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: '游记不存在' });
  }

  // 将游记标记为已删除
  travelogues[index].isdeleted = true;
  
  res.json({ message: '删除成功' });
});

// 更新游记    地址需要加游记Id     req需要包括title,desc,imagelist
app.put('/api/travelogues/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = travelogues.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: '游记不存在' });
  }

  const { title, desc, imglist, video } = req.body;

  // 验证必填字段
  if (!title || !title.trim()) {
    return res.status(400).json({ message: '标题不能为空' });
  }
  
  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: '描述不能为空' });
  }
  
  if (!imglist || imglist.length === 0) {
    return res.status(400).json({ message: '至少需要上传一张图片' });
  }

  // 更新游记信息
  travelogues[index] = {
    ...travelogues[index],
    title: req.body.title,
    desc: req.body.desc,
    imglist: req.body.imglist,
    status: 0,
    isdeleted:false,
    video
  };
  
  res.json({ message: '更新成功', data: travelogues[index] });
});

// 创建新游记     req需要title, desc, imglist, authorID, avatar, author
app.post('/api/travelogues', (req, res) => {
  const { title, desc, imglist, authorID, avatar, author, time,video } = req.body;
  
  // 验证必填字段
  if (!title || !title.trim()) {
    return res.status(400).json({ message: '标题不能为空' });
  }
  
  if (!desc || !desc.trim()) {
    return res.status(400).json({ message: '描述不能为空' });
  }
  
  if (!imglist || imglist.length === 0) {
    return res.status(400).json({ message: '至少需要上传一张图片' });
  }
  
  if (!authorID) {
    return res.status(400).json({ message: '作者ID不能为空' });
  }
  
  // 生成新ID (当前最大ID + 1)
  const newId = Math.max(...travelogues.map(t => t.id)) + 1;
  
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
    reason: '',
    isdeleted:false,
    time,
    video
  };

  // 添加到游记列表
  travelogues.push(newTravelogue);
  
  res.status(201).json({ 
    message: '创建成功', 
    data: newTravelogue 
  });
});

// 获取用户的所有游记
app.get('/api/travelogues/user/:openid', (req, res) => {
  const openid = req.params.openid;
  
  if (!openid) {
    return res.status(400).json({ message: '缺少openid参数' });
  }

  // 根据openid筛选游记
  const userTravelogues = travelogues.filter(t => t.authorID === openid);
  
  res.json(userTravelogues);
});

app.listen(port, '192.168.0.142', () => {
  console.log(`服务器运行在 http://192.168.0.142:${port}`);
}); 