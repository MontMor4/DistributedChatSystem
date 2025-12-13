import { test, expect } from '@playwright/test';

test('should register two users and exchange messages', async ({ browser }) => {
  // Create two isolated browser contexts for two different users
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Generate unique usernames
  const timestamp = Date.now();
  const user1 = {
    username: `user1_${timestamp}`,
    password: 'password123',
    fullName: `User One ${timestamp}`
  };
  const user2 = {
    username: `user2_${timestamp}`,
    password: 'password123',
    fullName: `User Two ${timestamp}`
  };

  // Register User 1
  await page1.goto('/signup');
  await page1.waitForLoadState('networkidle');
  await page1.fill('input[name="fullName"]', user1.fullName);
  await page1.fill('input[name="username"]', user1.username);
  await page1.fill('input[name="password"]', user1.password);
  await page1.click('button[type="submit"]');
  
  // Register User 2
  await page2.goto('/signup');
  await page2.waitForLoadState('networkidle');
  await page2.fill('input[name="fullName"]', user2.fullName);
  await page2.fill('input[name="username"]', user2.username);
  await page2.fill('input[name="password"]', user2.password);
  await page2.click('button[type="submit"]');

  // User 1 starts a chat with User 2
  // Wait for the user list to update and show User 2 on User 1's screen
  await page1.waitForTimeout(2000);
  await page1.goto('/chat');
  await page1.waitForLoadState('networkidle');
  
  // Ensure the sidebar is loaded
  await expect(page1.getByText('Chats')).toBeVisible();
  
  // Wait for User 2 to appear in the list (retry if needed)
  await expect(page1.getByText(user2.fullName)).toBeVisible();
  await page1.getByText(user2.fullName).click();

  // User 1 sends a message
  const messageContent = `Hello from ${user1.username}`;
  await page1.fill('input[placeholder="Type a message..."]', messageContent);
  await page1.press('input[placeholder="Type a message..."]', 'Enter');

  // Verify User 1 sees the message
  await expect(page1.getByText(messageContent)).toBeVisible();

  // User 2 should see the message
  // Wait for User 2 to see the message (real-time or reload)
  await page2.goto('/chat');
  await page2.waitForLoadState('networkidle');
  
  // Ensure the sidebar is loaded
  await expect(page2.getByText('Chats')).toBeVisible();
  
  // Open chat with User 1
  await expect(page2.getByText(user1.fullName)).toBeVisible({ timeout: 10000 });
  await page2.getByText(user1.fullName).click();
  
  await expect(page2.getByText(messageContent)).toBeVisible();

  // User 2 replies
  const replyContent = `Hello back from ${user2.username}`;
  await page2.fill('input[placeholder="Type a message..."]', replyContent);
  await page2.press('input[placeholder="Type a message..."]', 'Enter');

  // Verify User 1 sees the reply
  await expect(page1.getByText(replyContent)).toBeVisible();
});
