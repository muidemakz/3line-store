import type { ThemeConfig } from 'antd';
import { colors, semanticColors } from '@/theme/tokens/colors';
import { fontFamily } from '@/theme/tokens/typography';
import { radius } from '@/theme/tokens/radius';

export const appTheme: ThemeConfig = {
  token: {
    fontFamily,
    colorPrimary: semanticColors.actionPrimary,
    colorInfo: colors.info[500],
    colorSuccess: colors.success[500],
    colorWarning: colors.warning[500],
    colorError: colors.error[500],
    colorText: semanticColors.textPrimary,
    colorTextSecondary: semanticColors.textSecondary,
    colorTextTertiary: semanticColors.textMuted,
    colorTextLightSolid: semanticColors.textInverse,
    colorBgBase: semanticColors.bgBase,
    colorBgLayout: semanticColors.bgLayout,
    colorBgContainer: semanticColors.bgSurface,
    colorBorder: semanticColors.borderDefault,
    colorBorderSecondary: semanticColors.borderSoft,
    borderRadius: radius.md,
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 44,
    fontSize: 14,
    lineHeight: 1.57,
    wireframe: false
  },
  components: {
    Button: {
      borderRadius: radius.md,
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 44,
      fontWeight: 600,
      paddingInline: 16,
      primaryShadow: 'none',
      defaultColor: semanticColors.textSecondary,
      defaultBorderColor: semanticColors.borderDefault
    },
    Input: {
      borderRadius: radius.lg,
      controlHeight: 48,
      controlHeightSM: 40,
      paddingInline: 16,
      activeBorderColor: semanticColors.accent,
      hoverBorderColor: semanticColors.accent
    },
    Checkbox: {
      colorPrimary: semanticColors.actionPrimary,
      colorPrimaryHover: semanticColors.actionPrimaryHover,
      borderRadiusSM: radius.sm
    },
    Select: {
      borderRadius: radius.md,
      controlHeight: 40,
      activeBorderColor: semanticColors.accent,
      hoverBorderColor: semanticColors.accent
    },
    Card: {
      borderRadiusLG: radius.lg
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0
    },
    Layout: {
      bodyBg: semanticColors.bgLayout,
      headerBg: semanticColors.bgSurface,
      siderBg: semanticColors.bgSurface
    },
    Menu: {
      itemBorderRadius: radius.md,
      itemSelectedBg: colors.primary[50],
      itemSelectedColor: semanticColors.accent
    },
    Table: {
      headerBg: semanticColors.bgSurface,
      rowHoverBg: colors.neutral[50]
    },
    Tag: {
      borderRadiusSM: radius.sm
    }
  }
};
