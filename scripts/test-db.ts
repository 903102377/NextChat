import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function createTestUser() {
  const { prisma } = await import('../app/lib/db');

  try {
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: { name: 'Test User' },
      create: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('Created or updated test user:', user);

    // 验证聊天可以创建
    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        topic: '我的第一个聊天',
      },
    });
    console.log('Created test chat:', chat);

    // 添加测试消息
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: '你好，这是一个测试消息！',
        date: new Date().toLocaleString(),
      },
    });
    console.log('Created test message:', message);

    await prisma.$disconnect();
    console.log('\n所有测试数据创建成功！');
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUser();
