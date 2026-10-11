import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import { faker } from '@faker-js/faker'
import * as auth from '../playwright/.auth/user.json'

test('Has title', async ({ page }) => {

  await page.route('*/**/api/tags', async route => { // must be declared before fetching the page
    await route.fulfill({
      json: tags
    })
  })

  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseJSON = await response.json()
    responseJSON.articles[0].title = 'my title'
    responseJSON.articles[0].description = 'my description'
    await route.fulfill({
      json: responseJSON
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')

  // Expect a title "to contain" a substring.
  await expect(page.locator('.navbar-brand')).toHaveText(/conduit/);
  await expect(page.locator('.sidebar .tag-pill')).toContainText(['Automation'])
  await expect(page.locator('.preview-link h1').first()).toContainText('my title')
  await expect(page.locator('.preview-link p').first()).toContainText('my description')
});

test('Delete article', async ({request}) => {


  // create an article

  const dataBody = {
    'article': {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tagList: [...faker.lorem.words({min: 1, max: 3}).split(' ')]
    }
  }
  console.log(dataBody);

  const token = auth.origins[0].localStorage.find(
    item => item.name === 'jwtToken'
  )?.value;

  if (!token) {
    throw new Error('jwtToken not found in saved auth state');
  }  
  console.log(token);

  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: dataBody,
    headers: {
      Authorization: `Token ${token}`
    }
  })

  

  expect(newArticleResponse.status()).toEqual(201)
  const newArticleResponseJSON = await newArticleResponse.json()
  const articleSlug = newArticleResponseJSON.article.slug
  
  // delete the article
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  expect(deleteArticleResponse.status()).toEqual(204)
})

