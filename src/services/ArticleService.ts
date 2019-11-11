import { constructURL } from '@/utils'
import { IArticleItem, IArticle } from '@/models/IArticle'
import repository from '@/repository/repository'

class ArticleService {
  private baseUrl = process.env.VUE_APP_DEV_URL || ''

  public async queryAllArticles(): Promise<IArticleItem[]> {
    const response = await fetch(constructURL(this.baseUrl, 'articles'))
    const articles = <IArticleItem[]>await response.json()
    return articles
  }

  public async allStoredIds(): Promise<number[]> {
    const ids = await repository.allDocIds('article')
    return ids.map((id) => parseInt(id.split('-').pop() || '', 10))
  }

  public async queryArticle(id: number): Promise<IArticle | null> {
    try {
      const response = await fetch(constructURL(this.baseUrl, `articles/${id}`))
      const article = <IArticle>await response.json()
      return article
    } catch (error) {
      return null
    }
  }

  public async storeArticle(id: number, update?: boolean): Promise<boolean> {
    const article = await this.queryArticle(id)
    if (article) {
      const oldArticle = await repository.get(this.getStoreId(id))
      if (oldArticle) {
        if (update) {
          return await repository.update(this.getStoreId(id), article)
        }
      } else {
        return await this.saveArticle(article)
      }
    }
    return false
  }

  public async get(id: number): Promise<IArticle | null> {
    return await repository.get(this.getStoreId(id))
  }

  public async removeArticle(id: number): Promise<boolean> {
    return await repository.remove(this.getStoreId(id))
  }

  public async saveArticle(article: IArticle): Promise<boolean> {
    return await repository.save(this.toStoreArticle(article))
  }

  private toStoreArticle(article: IArticle): IArticle {
    return {
      _id: this.getStoreId(article.id),
      ...article
    }
  }

  private getStoreId(id: number): string {
    return `article-${id}`
  }
}

export default new ArticleService()