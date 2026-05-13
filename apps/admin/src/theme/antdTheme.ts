import type { ThemeConfig } from 'antd';
import { colors, semanticColors } from '@/theme/tokens/colors';
import { fontFamily } from '@/theme/tokens/typography';
import { radius } from '@/theme/tokens/radius';

export const appTheme: ThemeConfig = {
  token: {
    fontFamily,
    colorPrimary: colors.primary[500],
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
      fontWeight: 500,
      paddingInline: 16,
      primaryShadow: 'none'
    },
    Input: {
      borderRadius: radius.md,
      controlHeight: 40,
      controlHeightSM: 32,
      paddingInline: 12,
      activeBorderColor: colors.primary[500],
      hoverBorderColor: colors.primary[500]
    },
    Checkbox: {
      colorPrimary: colors.primary[700],
      colorPrimaryHover: colors.primary[600],
      borderRadiusSM: radius.sm
    },
    Select: {
      borderRadius: radius.md,
      controlHeight: 40,
      activeBorderColor: colors.primary[500],
      hoverBorderColor: colors.primary[500]
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
      itemSelectedColor: colors.primary[700]
    },
    Table: {
      headerBg: semanticColors.bgSurface,
      rowHoverBg: colors.neutral[50]
    }
  }
};
