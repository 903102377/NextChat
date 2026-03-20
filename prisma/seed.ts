import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建测试数据...');

  // 创建测试用户
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '测试用户',
      avatar: '😀',
    },
  });
  console.log('已创建用户:', user);

  // 创建测试聊天
  const chat = await prisma.chat.create({
    data: {
      userId: user.id,
      topic: '我的第一个聊天',
      messages: {
        create: [
          {
            role: 'user',
            content: '你好，这是一个测试消息！',
            date: new Date().toLocaleString(),
          },
          {
            role: 'assistant',
            content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？',
            date: new Date().toLocaleString(),
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });
  console.log('已创建聊天:', chat);

  console.log('\n✅ 测试数据创建成功！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
