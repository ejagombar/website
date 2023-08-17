import * as React from 'react'
import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number
}

export const GitHubIcon: React.FC<IconSvgProps> = ({
    size = 24,
    width,
    height,
    ...props
}) => {
    return (
        <svg
            height={size || height}
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                clipRule="evenodd"
                d="M119.07 70.925c-.228-.045-1.205-.461-1.756-.747-2.886-1.5-5.165-4.347-6.057-7.564-.31-1.115-.428-2.053-.43-3.391 0-1.099.045-1.588.236-2.542.889-4.44 4.255-8.11 8.542-9.312 2.45-.688 5.253-.549 7.561.375 2.811 1.125 5.073 3.236 6.426 5.996.618 1.261.992 2.525 1.18 3.992.075.575.074 2.378 0 2.982-.235 1.907-.851 3.646-1.838 5.187-1.425 2.225-3.358 3.848-5.712 4.795-.726.293-.986.31-1.21.08l-.152-.155-.029-2.176c-.03-2.329-.042-2.45-.291-3.024a2.865 2.865 0 0 0-.305-.505l-.192-.248.385-.055c1.23-.176 2.188-.521 3.015-1.086 1.006-.686 1.625-1.752 1.93-3.318.1-.516.143-1.962.072-2.426-.12-.79-.503-1.667-.982-2.253l-.188-.23.115-.408c.205-.723.15-1.737-.138-2.56-.091-.261-.12-.3-.262-.336-.437-.116-1.676.35-2.75 1.031-.268.17-.411.233-.496.218a30.1 30.1 0 0 1-.596-.124 11.213 11.213 0 0 0-4.639 0c-.262.057-.53.113-.598.125-.088.015-.215-.04-.455-.198-.959-.628-2.315-1.136-2.814-1.054-.151.026-.162.042-.274.418-.182.61-.228.923-.224 1.52.003.443.026.634.12.959l.118.405-.18.22c-.475.576-.869 1.479-.99 2.267-.07.464-.027 1.911.073 2.425.241 1.233.708 2.213 1.359 2.853.49.481 1.278.948 2.05 1.213.335.115 1.232.31 1.655.36l.269.03-.183.238c-.238.307-.41.684-.501 1.098-.072.323-.078.333-.27.406-.42.16-.64.195-1.229.197-.603.003-.614.001-.928-.16-.407-.21-.759-.556-1.08-1.067-.467-.74-1.175-1.261-1.802-1.326-.361-.037-.63.042-.63.186 0 .11.378.501.71.736.114.08.318.297.455.481.224.3.336.513.749 1.41.226.493.794.945 1.422 1.134.142.043.555.102.917.132.537.044.741.041 1.115-.015l.459-.07.011.845c.024 1.696.013 1.787-.22 1.944-.124.083-.376.126-.543.092z"
                transform="translate(-110.828 -46.937)"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    )
}

export const DownloadIcon: React.FC<IconSvgProps> = ({
    size = 24,
    width,
    height,
    ...props
}) => {
    return (
        <svg
            height={size || height}
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M21 16.5V21H3v-4.5H0V21c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3v-4.5Zm-1.5-6-2.115-2.115-3.885 3.87V0h-3v12.255l-3.885-3.87L4.5 10.5 12 18z"
                fill="currentColor"
            />
        </svg>
    )
}

export const LinkedInIcon: React.FC<IconSvgProps> = ({
    size = 24,
    width,
    height,
    ...props
}) => {
    return (
        <svg
            height={size || height}
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                clipRule="evenodd"
                d="M80.004 71.715a1.784 1.784 0 0 1-1.284-1.266c-.04-.16-.046-1.39-.046-10.676 0-6.975.01-10.55.03-10.659.051-.267.22-.583.428-.8.219-.227.387-.342.676-.457l.211-.085 10.558-.007c9.41-.007 10.58-.003 10.759.038a1.76 1.76 0 0 1 1.308 1.311c.02.106.03 3.835.03 10.659 0 11.58.016 10.639-.19 11.052-.14.283-.457.595-.747.736-.454.22.552.202-11.077.2-9.044-.002-10.513-.008-10.656-.046zm5.788-9.234v-5.73l-1.79-.007-1.791-.008v11.49l1.79-.008 1.791-.008zm5.789 2.783c0-3.49.015-3.777.228-4.395.308-.889 1.043-1.321 2.114-1.244.855.063 1.32.516 1.546 1.51.051.225.057.495.071 3.659l.015 3.416 1.806.008 1.806.008V64.75c0-2.816-.008-3.577-.045-4.013-.095-1.147-.309-1.95-.69-2.6-.647-1.105-1.83-1.672-3.496-1.676-.863-.001-1.529.17-2.198.566-.456.27-.949.745-1.164 1.123-.05.087-.102.159-.117.159-.016 0-.027-.338-.027-.787v-.786l-1.716.008-1.715.008-.008 5.699c-.004 3.134-.001 5.716.007 5.737.01.03.399.037 1.798.037h1.785zm-7.066-10.131c.85-.218 1.452-.909 1.565-1.8.127-1.005-.584-2-1.607-2.247a1.87 1.87 0 0 0-.933-.002c-.36.086-.655.241-.908.476-.539.499-.764 1.086-.69 1.798.05.486.236.863.606 1.233.518.518 1.26.722 1.967.541z"
                transform="translate(-78.674 -47.762)"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    )
}

export const EmailIcon: React.FC<IconSvgProps> = ({
    size = 24,
    width,
    height,
    ...props
}) => {
    return (
        <svg
            height={size || height}
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                clipRule="evenodd"
                d="M188.88 99.648c0-1.32-1.08-2.4-2.4-2.4h-19.2c-1.32 0-2.4 1.08-2.4 2.4v14.4c0 1.32 1.08 2.4 2.4 2.4h19.2c1.32 0 2.4-1.08 2.4-2.4zm-2.4 0-9.6 5.988-9.6-5.988zm0 14.4h-19.2v-12l9.6 6 9.6-6z"
                transform="translate(-164.88 -94.748)"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    )
}

export const DocumentIcon: React.FC<IconSvgProps> = ({
    size = 24,
    width,
    height,
    ...props
}) => {
    return (
        <svg
            height={size || height}
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                clipRule="evenodd"
                fill="currentColor"
                fillRule="evenodd"
                d="M134.15 118.745h9.6v2.4h-9.6zm0-4.8h9.6v2.4h-9.6zm7.2-12h-9.6c-1.32 0-2.4 1.08-2.4 2.4v19.2c0 1.32 1.068 2.4 2.388 2.4h14.412c1.32 0 2.4-1.08 2.4-2.4v-14.4zm4.8 21.6h-14.4v-19.2h8.4v6h6z"
                transform="translate(-129.35 -101.945)"
            />
        </svg>
    )
}
