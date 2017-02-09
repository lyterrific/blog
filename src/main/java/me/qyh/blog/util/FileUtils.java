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
package me.qyh.blog.util;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Objects;

import me.qyh.blog.exception.SystemException;

public class FileUtils {

	private FileUtils() {

	}

	/**
	 * 采用随机6位前缀，创建一个临时空文件，<strong>需要手动删除！</strong>
	 * 
	 * @param ext
	 *            文件名后缀
	 * @return 临时文件
	 */
	public static File temp(String ext) {
		try {
			return File.createTempFile(StringUtils.uuid(), "." + ext);
		} catch (IOException e) {
			throw new SystemException(e.getMessage(), e);
		}
	}

	/**
	 * write bits to file
	 * 
	 * @param bytes
	 * @param file
	 * @throws IOException
	 */
	public static void write(byte[] bytes, File file) throws IOException {
		Files.write(file.toPath(), bytes, StandardOpenOption.WRITE);
	}

	/**
	 * 文件重命名
	 * 
	 * @param file
	 *            要重命名的文件
	 * @param newName
	 *            新文件名
	 * 
	 */
	public static void rename(File file, File newNameFile) {
		Objects.requireNonNull(file);
		Objects.requireNonNull(newNameFile);
		try {
			Files.move(file.toPath(), newNameFile.toPath());
		} catch (IOException e) {
			throw new SystemException(e.getMessage(), e);
		}
	}

	/**
	 * 获取文件的后缀名
	 * 
	 * @param fullName
	 * @return
	 */
	public static String getFileExtension(String fullName) {
		String fileName = new File(fullName).getName();
		int dotIndex = fileName.lastIndexOf('.');
		return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
	}

	/**
	 * 获取文件名(不包括后缀)
	 * 
	 * @param file
	 * @return
	 */
	public static String getNameWithoutExtension(String file) {
		String fileName = new File(file).getName();
		int dotIndex = fileName.lastIndexOf('.');
		return (dotIndex == -1) ? fileName : fileName.substring(0, dotIndex);
	}

	/**
	 * 删除文件|文件夹
	 * 
	 * @param file
	 * @return
	 */
	public static boolean deleteQuietly(File file) {
		if (file == null || !file.exists()) {
			return true;
		}
		try {
			Files.walkFileTree(file.toPath(), new SimpleFileVisitor<Path>() {
				@Override
				public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
					Files.delete(file);
					return FileVisitResult.CONTINUE;
				}

				@Override
				public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
					Files.delete(dir);
					return FileVisitResult.CONTINUE;
				}
			});
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * 创建一个文件夹，如果失败，抛出异常
	 * 
	 * @param parentFile
	 */
	public static void forceMkdir(File dir) {
		if (dir.exists()) {
			return;
		}
		synchronized (FileUtils.class) {
			if (!dir.exists() && !dir.mkdirs()) {
				throw new SystemException("创建文件夹：" + dir.getAbsolutePath() + "失败");
			}
		}
	}

	/**
	 * 拷贝一个文件
	 * 
	 * @param source
	 * @param target
	 * @throws IOException
	 */
	public static void copy(File source, File target) throws IOException {
		Files.copy(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
	}

	/**
	 * 移动一个文件
	 * 
	 * @param png
	 * @param dest
	 * @throws IOException
	 */
	public static void move(File source, File target) throws IOException {
		Files.move(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
	}

	/**
	 * write file to outputstream
	 * 
	 * @param file
	 * @param outputStream
	 * @throws IOException
	 */
	public static void write(File file, OutputStream outputStream) throws IOException {
		Files.copy(file.toPath(), outputStream);
		outputStream.flush();
	}
}
