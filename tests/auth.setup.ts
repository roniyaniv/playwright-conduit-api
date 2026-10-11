// see https://playwright.dev/docs/auth

import { faker } from '@faker-js/faker';
import { test as setup, expect } from '@playwright/test';
import path from 'path';


const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json')

setup('sign up as new user', async ({ page }) => {

  // create a user
  const requestData = {
    "user": {
        "email": faker.internet.email(),
        "password": faker.internet.password(),
        "username": faker.internet.username()      
    }
  }

  await page.goto('https://conduit.bondaracademy.com/register')
  await page.getByPlaceholder('Username').fill(requestData.user.username)
  await page.getByPlaceholder('Email').fill(requestData.user.email)
  await page.getByPlaceholder('Password').fill(requestData.user.password)
  await page.getByRole('button', { name: 'Sign up' }).click()

  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });

});