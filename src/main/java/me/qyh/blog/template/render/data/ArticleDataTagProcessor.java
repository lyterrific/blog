/*
 * Copyright 2016 qyh.me
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package me.qyh.blog.template.render.data;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import me.qyh.blog.core.entity.Article;
import me.qyh.blog.core.exception.LogicException;
import me.qyh.blog.core.service.ArticleService;

/**
 * 文章详情数据数据器
 * 
 * @author Administrator
 *
 */
public class ArticleDataTagProcessor extends DataTagProcessor<Article> {

	@Autowired
	private ArticleService articleService;

	public ArticleDataTagProcessor(String name, String dataName) {
		super(name, dataName);
	}

	@Override
	protected Article query(Attributes attributes) throws LogicException {
		// 首先从属性中获取
		String idOrAlias = attributes.get("idOrAlias").orElse(null);
		boolean ignoreException = attributes.getBoolean("ignoreException").orElse(false);
		if (idOrAlias == null) {
			if (ignoreException) {
				return null;
			}
			throw new LogicException("article.notExists", "文章不存在");
		}
		Optional<Article> op = articleService.getArticleForView(idOrAlias);
		if (op.isPresent()) {
			return op.get();
		}
		if (!ignoreException) {
			throw new LogicException("article.notExists", "文章不存在");
		}
		return null;
	}

}
