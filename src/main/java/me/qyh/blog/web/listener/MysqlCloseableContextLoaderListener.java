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
package me.qyh.blog.web.listener;

import javax.servlet.ServletContextEvent;

import com.mysql.jdbc.AbandonedConnectionCleanupThread;

/**
 * {@link http://docs.oracle.com/cd/E17952_01/connector-j-relnotes-en/news-5-1-23.html
 * }
 * 
 * @author Administrator
 *
 */
public class MysqlCloseableContextLoaderListener extends AppContextLoaderListener {

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		super.contextDestroyed(event);
		// mysql connector 5.1.41
		AbandonedConnectionCleanupThread.checkedShutdown();
	}

}
