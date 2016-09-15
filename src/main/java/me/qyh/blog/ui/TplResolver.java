package me.qyh.blog.ui;

import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.thymeleaf.IEngineConfiguration;
import org.thymeleaf.cache.AlwaysValidCacheEntryValidity;
import org.thymeleaf.cache.ICacheEntryValidity;
import org.thymeleaf.cache.NonCacheableCacheEntryValidity;
import org.thymeleaf.spring4.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.spring4.templateresource.SpringResourceTemplateResource;
import org.thymeleaf.templateresource.ITemplateResource;

import me.qyh.blog.ui.page.Page;

public class TplResolver extends SpringResourceTemplateResolver {

	private static final String EMPTY = "empty";

	@Override
	protected String computeResourceName(IEngineConfiguration configuration, String ownerTemplate, String template,
			String prefix, String suffix, Map<String, String> templateAliases,
			Map<String, Object> templateResolutionAttributes) {
		Page page = UIContext.get();
		if (page != null && page.getTemplateName().equals(template)) {
			return template;
		}
		// 如果挂件不存在，返回空页面
		return super.computeResourceName(configuration, ownerTemplate, isTpl(template) ? EMPTY : template, prefix,
				suffix, templateAliases, templateResolutionAttributes);
	}

	@Override
	protected ITemplateResource computeTemplateResource(IEngineConfiguration configuration, String ownerTemplate,
			String template, String resourceName, String characterEncoding,
			Map<String, Object> templateResolutionAttributes) {
		Page page = UIContext.get();
		if (page != null && page.getTemplateName().equals(template)) {
			return new SpringResourceTemplateResource(
					new ByteArrayResource(page.getTpl().getBytes(), page.getTemplateName()), characterEncoding);
		}
		return super.computeTemplateResource(configuration, ownerTemplate, template, resourceName, characterEncoding,
				templateResolutionAttributes);
	}

	@Override
	protected ICacheEntryValidity computeValidity(IEngineConfiguration configuration, String ownerTemplate,
			String template, Map<String, Object> templateResolutionAttributes) {
		if (isTpl(template)) {
			/**
			 * 系统模板不必缓存
			 */
			return NonCacheableCacheEntryValidity.INSTANCE;
		}
		return AlwaysValidCacheEntryValidity.INSTANCE;
	}

	private boolean isTpl(String templateName) {
		return Page.isTpl(templateName);
	}

}
