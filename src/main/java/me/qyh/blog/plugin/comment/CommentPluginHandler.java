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
package me.qyh.blog.plugin.comment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import me.qyh.blog.core.message.Messages;
import me.qyh.blog.core.plugin.DataTagProcessorRegistry;
import me.qyh.blog.core.plugin.Menu;
import me.qyh.blog.core.plugin.MenuRegistry;
import me.qyh.blog.core.plugin.PluginHandler;
import me.qyh.blog.core.plugin.PluginProperties;
import me.qyh.blog.core.plugin.TemplateRegistry;
import me.qyh.blog.core.util.Resources;
import me.qyh.blog.plugin.comment.data.CommentsDataTagProcessor;
import me.qyh.blog.plugin.comment.data.LastCommentsDataTagProcessor;

public class CommentPluginHandler implements PluginHandler {

	private static final String ENABLE_KEY = "plugin.comment.email.enable";
	private static final String LOCATION_KEY = "plugin.comment.email.templateLocation";
	private static final String SUBJECT_KEY = "plugin.comment.email.subject";
	private static final String TIPCOUNT_KEY = "plugin.comment.email.tipCount";
	private static final String PROCESS_SEND_SEC_KEY = "plugin.comment.email.processSendSec";
	private static final String FORCE_SEND_SEC_KEY = "plugin.comment.email.forceSendSec";

	private final PluginProperties pluginProperties = PluginProperties.getInstance();

	@Autowired
	private Messages messages;

	@Override
	public void initialize(ConfigurableApplicationContext applicationContext) {
		CommentConfig cc = new CommentConfig(pluginProperties.get(ENABLE_KEY).map(Boolean::parseBoolean).orElse(false));

		if (cc.isEnableEmailNotify()) {
			EmailNofityConfig config = new EmailNofityConfig();
			pluginProperties.get(LOCATION_KEY).ifPresent(config::setTemplateLocation);
			pluginProperties.get(SUBJECT_KEY).ifPresent(config::setMailSubject);
			pluginProperties.get(TIPCOUNT_KEY).map(Integer::parseInt).ifPresent(config::setMessageTipCount);
			pluginProperties.get(PROCESS_SEND_SEC_KEY).map(Integer::parseInt).ifPresent(config::setProcessSendSec);
			pluginProperties.get(FORCE_SEND_SEC_KEY).map(Integer::parseInt).ifPresent(config::setForceSendSec);

			cc.setConfig(config);
		}

		applicationContext.addBeanFactoryPostProcessor(new CommentBeanDefinitionRegistryPostProcessor(cc));
	}

	@Override
	public void addMenu(MenuRegistry registry) {
		registry.addMenu(new Menu(messages.getMessage("plugin.comment.menu.commentMgr", "评论管理"))
				.addChild(new Menu(messages.getMessage("plugin.comment.menu.uncheck", "未审核评论"), "mgr/comment/uncheck"))
				.addChild(
						new Menu(messages.getMessage("plugin.comment.menu.config", "配置"), "mgr/comment/updateConfig")));
	}

	@Override
	public void addTemplate(TemplateRegistry registry) throws Exception {
		registry.registerGlobalFragment(messages.getMessage("plugin.comment.data.comment", "评论"),
				Resources.readResourceToString(
						new ClassPathResource("me/qyh/blog/plugin/comment/template/comments.html")),
				true)
				.registerGlobalFragment(messages.getMessage("plugin.comment.data.widget", "评论挂件"),
						Resources.readResourceToString(
								new ClassPathResource("me/qyh/blog/plugin/comment/template/commentWidget.html")),
						true)
				.registerGlobalFragment(messages.getMessage("plugin.comment.data.lastComments", "最近评论"),
						Resources.readResourceToString(
								new ClassPathResource("me/qyh/blog/plugin/comment/template/lastComments.html")),
						false);
	}

	@Override
	public void addDataTagProcessor(DataTagProcessorRegistry registry) {
		CommentsDataTagProcessor cdtp = new CommentsDataTagProcessor(
				messages.getMessage("plugin.comment.data.comment", "评论"), "commentPage");
		cdtp.setCallable(true);
		SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(cdtp);
		registry.register(cdtp);

		LastCommentsDataTagProcessor lcdtp = new LastCommentsDataTagProcessor(
				messages.getMessage("plugin.comment.data.lastComment", "最近评论"), "comments");
		SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext(lcdtp);
		registry.register(lcdtp);
	}

}
