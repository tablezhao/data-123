import { expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 自动清理测试环境
afterEach(() => {
  cleanup();
});

// 全局配置
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
