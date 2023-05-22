<template>
  <main style="margin-top: 20px">
    <div v-if="!hasLogin">
      <div>
        <Input
          v-model="checkInfo"
          placeholder="请输入验证码"
          style="width: 200px; margin-right: 20px"
        />
        <Button type="primary" size="mini" @click="login">登录</Button>
      </div>
      <div v-if="loginError" class="error-tip">
        验证码不正确，无法使用下载功能
      </div>
    </div>
    <div
      v-else
      class="item"
      v-for="item in pngList"
      :key="item.pageName"
      :ref="(el) => setItemRefs(el, item.pageName)"
    >
      <ImagePreviewGroup infinite>
        <Space direction="vertical">
          <Image
            :src="`${baseUri}/${item.imgSrc}`"
            width="500"
            :title="item.title"
            :description="item.desc"
            footerPosition="outer"
          />
          <Popconfirm @ok="() => clickAddBtn(item)">
            <template #content>
              <Input placeholder="请输入添加路径" v-model="item.destPath" />
            </template>
            <template #icon><IconFolder /></template>
            <Button
              type="outline"
              size="mini"
              :loading="item.btnLoading"
              style="margin-left: 45%"
            >
              添加模板
            </Button>
          </Popconfirm>
        </Space>
      </ImagePreviewGroup>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { PNG_LIST } from "@/constant";

import {
  Button,
  Popconfirm,
  Input,
  Message,
  Image,
  Space,
  ImagePreviewGroup,
} from "@arco-design/web-vue/es";
import { IconFolder } from "@arco-design/web-vue/es/icon";

import "@arco-design/web-vue/es/popconfirm/style/css.js";
import "@arco-design/web-vue/es/input/style/css.js";
import "@arco-design/web-vue/es/button/style/css.js";
import "@arco-design/web-vue/es/image/style/css.js";
import "@arco-design/web-vue/es/space/style/css.js";

const pngList = reactive(PNG_LIST);

const baseUri = ref("");
const refObj: any = reactive({});

const checkInfo = ref("");
const hasLogin = ref(true);
const loginError = ref(false);

const setItemRefs = (el: any, pageName: string) => {
  refObj[pageName] = el;
};

onMounted(() => {
  const dataUri = document.querySelector("input[data-uri]");
  if (!dataUri) return;

  baseUri.value = dataUri.getAttribute("data-uri") || "";
});

// @ts-ignore
// eslint-disable-next-line no-undef
const vscode = acquireVsCodeApi();

const login = () => {
  vscode.postMessage({
    command: "login",
    password: checkInfo.value,
  });
};

const clickAddBtn = (item: { [name: string]: string | boolean }) => {
  Message.info("下载中，请稍等...");
  item.btnLoading = true;

  const { templatePath, destPath, pageName, type } = item;

  vscode.postMessage({
    command: "copy",
    type,
    pageName, // 页面标识，唯一
    destPath,
    templatePath,
  });
};

window.addEventListener("message", (event) => {
  const { command, pageName, message } = event.data;

  const findItem: any =
    pngList.find((item) => item.pageName === pageName) || {};
  findItem.btnLoading = false;

  switch (command) {
    case "download_error":
      Message.error(`下载异常：${message}`);
      break;
    case "download_complete":
      Message.success("文件下载成功!");
      break;
    case "location":
      refObj[pageName]?.scrollIntoView();
      break;
    case "login":
      hasLogin.value = message;
      loginError.value = !message;
      break;
    default:
      break;
  }
});
</script>

<style>
.error-tip {
  color: #e63f3f;
}
.item {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  margin-bottom: 8px;
  padding: 12px;
  background-color: #e5e5e5;
}
.arco-popconfirm-popup-content .arco-popconfirm-footer > button {
  margin-left: -45px;
  margin-top: -8px;
}
.arco-input-wrapper {
  height: 24px;
}
.arco-image-footer-caption-title,
.arco-image-footer-caption-description {
  font-size: 12px;
}
</style>
