import {
    rem,
    type ColorScheme,
    type MantineThemeOverride,
} from '@mantine/core';

export const getMantineThemeOverride = (overrides?: {
    colorScheme?: ColorScheme;
    components?: Partial<MantineThemeOverride['components']>;
}) =>
    ({
        ...overrides,

        focusRing: 'auto',

        //Black value from Blueprint. We could change this.
        // Without it things look a little darker than before.
        black: '#111418',

        colors: {
            offWhite: ['#FDFDFD'],
        },

        spacing: {
            one: rem(1),
            two: rem(2),
            xxs: rem(4),
            xs: rem(8),
            sm: rem(12),
            md: rem(16),
            lg: rem(20),
            xl: rem(24),
            xxl: rem(32),
            '3xl': rem(40),
            '4xl': rem(48),
            '5xl': rem(64),
            '6xl': rem(80),
            '7xl': rem(96),
            '8xl': rem(128),
            '9xl': rem(160),
        },

        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Oxygen',
            'Ubuntu',
            'Cantarell',
            'Fira Sans',
            'Droid Sans',
            'Open Sans',
            'Helvetica Neue',
            'Apple Color Emoji',
            'Segoe UI Emoji',
            'sans-serif',
        ].join(', '),

        lineHeight: 1.4,

        cursorType: 'pointer',

        shadows: {
            subtle: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
            heavy: '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba(10, 13, 18, 0.04)',
        },

        components: {
            Button: {
                variants: {
                    darkPrimary: (theme) => ({
                        root: {
                            border: `1px solid #414E62`,
                            boxShadow: '0px 0px 0px 1px #151C24',
                            background: theme.fn.linearGradient(
                                180,
                                '#202B37',
                                '#151C24',
                            ),
                            borderRadius: theme.radius.md,
                            color: theme.colors.gray[0],
                            ...theme.fn.hover({
                                background: theme.colors.dark[4],
                            }),
                            '&[data-loading]': {
                                boxShadow: theme.shadows.subtle,
                            },
                            '&[data-disabled]': {
                                boxShadow: theme.shadows.subtle,
                                color: theme.colors.gray[5],
                            },
                        },
                    }),
                },
            },
            Kbd: {
                styles: (theme, _params) => ({
                    root: {
                        borderBottomWidth: theme.spacing.two,
                    },
                }),
            },

            Tooltip: {
                defaultProps: {
                    withArrow: true,
                },
                variants: {
                    xs: (theme) => ({
                        tooltip: {
                            fontSize: theme.fontSizes.xs,
                        },
                    }),
                },
            },

            Modal: {
                defaultProps: {
                    // FIXME: This makes the mantine modals line up exactly with the Blueprint ones.
                    // It could be made a less-magic number once we migrate
                    yOffset: 140,
                },
            },

            Alert: {
                styles: (_theme, _params) => ({
                    title: {
                        // FIXME: This makes the icon align with the title.
                        lineHeight: 1.55,
                    },
                }),
            },

            ScrollArea: {
                variants: {
                    primary: (theme) => ({
                        scrollbar: {
                            '&, &:hover': {
                                background: 'transparent',
                            },
                            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb':
                                {
                                    backgroundColor: theme.colors.gray['5'],
                                },
                            '&[data-orientation="vertical"][data-state="visible"] .mantine-ScrollArea-thumb':
                                {
                                    // When visible, fade in
                                    animation: 'fadeIn 0.3s ease-in forwards',
                                },

                            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover':
                                {
                                    backgroundColor: theme.fn.darken(
                                        theme.colors.gray['5'],
                                        0.1,
                                    ),
                                },
                        },
                        viewport: {
                            '.only-vertical & > div': {
                                display: 'block !important', // Only way to override the display value (from `table`) of the Viewport's child element
                            },
                        },
                    }),
                },
            },
            ...overrides?.components,
        },

        other: {
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: 200, // in ms
        },

        globalStyles: (theme) => ({
            'html, body': {
                backgroundColor: theme.colors.gray[0],
            },

            body: {
                fontSize: '14px',
            },

            p: {
                marginBottom: '10px',
                marginTop: 0,
            },

            b: {
                fontWeight: 'bold',
            },

            strong: {
                fontWeight: 600,
            },

            '.react-draggable.react-draggable-dragging .tile-base': {
                border: `1px solid ${theme.colors.blue[5]}`,
            },

            '.ace_editor.ace_autocomplete': {
                width: '500px',
            },
            '.ace_editor *': {
                fontFamily:
                    "Menlo, 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
            },
            '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
            },
        }),
    } satisfies MantineThemeOverride);
