'use client';

import { AwardBadge } from '@/components/AwardBadge';

// Exact HTML structure from original Zeit Media website for Footer
export default function Footer() {
    return (
        <footer className="footer_wrap">
            <h2 className="footer_title u-sr-only">Footer</h2>
            <div className="footer_contain u-container">
                <nav className="footer_layout u-grid-above">
                    <div className="footer_left_wrap">
                        <div id="w-node-_70a1202c-0356-a69f-1ade-01bdf897f8ee-3814999f" className="u-width-full">
                            <div className="footer_main_title">Innovation Meets Culture</div>
                            <div className="u-max-width-50ch">
                                <p className="u-text-style-main u-opacity-60">
                                    We create a space where anyone, anywhere has the power to transform their ideas into reality.
                                </p>
                            </div>
                        </div>
                        <div className="footer_cta">
                            <a href="/register" className="block max-w-xs">
                                <AwardBadge>
                                    GET YOUR GATE PASS
                                </AwardBadge>
                            </a>
                        </div>
                    </div>

                    <div className="footer_nav">
                        <section className="footer_group_wrap">
                            <ul className="footer_group_list">
                                <li className="footer_group_item">
                                    <a href="/" className="footer_link_wrap w-inline-block">
                                        <div className="footer_link_text u-text-style-small">HOME</div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="u-icon-medium"
                                        >
                                            <path
                                                stroke="#fff"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="m8 16 8-8m0 0h-6m6 0v6"
                                                opacity=".6"
                                            />
                                        </svg>
                                        <div className="footer_link_bg" />
                                    </a>
                                </li>
                                <li className="footer_group_item">
                                    <a href="/events" className="footer_link_wrap w-inline-block">
                                        <div className="footer_link_text u-text-style-small">EVENTS</div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="u-icon-medium"
                                        >
                                            <path
                                                stroke="#fff"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="m8 16 8-8m0 0h-6m6 0v6"
                                                opacity=".6"
                                            />
                                        </svg>
                                        <div className="footer_link_bg" />
                                    </a>
                                </li>
                                <li className="footer_group_item">
                                    <a href="/sana-arena" className="footer_link_wrap w-inline-block">
                                        <div className="footer_link_text u-text-style-small">SA NA ARENA</div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="u-icon-medium"
                                        >
                                            <path
                                                stroke="#fff"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="m8 16 8-8m0 0h-6m6 0v6"
                                                opacity=".6"
                                            />
                                        </svg>
                                        <div className="footer_link_bg" />
                                    </a>
                                </li>
                                <li className="footer_group_item">
                                    <a href="/register" className="footer_link_wrap w-inline-block">
                                        <div className="footer_link_text u-text-style-small">REGISTER</div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="u-icon-medium"
                                        >
                                            <path
                                                stroke="#fff"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="m8 16 8-8m0 0h-6m6 0v6"
                                                opacity=".6"
                                            />
                                        </svg>
                                        <div className="footer_link_bg" />
                                    </a>
                                </li>
                            </ul>

                            {/* Instagram only */}
                            <div className="footer_cta">
                                <ul className="social_link_wrap">
                                    <li className="social_link_item">
                                        <a
                                            href="https://www.instagram.com/cittakshashila/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Instagram"
                                            className="social_link w-inline-block"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100%"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                className="u-icon-large u-zindex-2"
                                            >
                                                <path
                                                    fill="#fff"
                                                    d="M16.005 12.693a3.306 3.306 0 1 0 0 6.612 3.306 3.306 0 0 0 0-6.612Zm13.24-3.267a8.668 8.668 0 0 0-.56-3.013 5.333 5.333 0 0 0-3.093-3.094 8.667 8.667 0 0 0-3.014-.56c-1.72-.093-2.226-.093-6.573-.093-4.346 0-4.853 0-6.573.093a8.667 8.667 0 0 0-3.013.56 5.333 5.333 0 0 0-3.094 3.094 8.666 8.666 0 0 0-.56 3.013c-.093 1.72-.093 2.227-.093 6.573 0 4.347 0 4.854.093 6.574a9.2 9.2 0 0 0 .56 3.026 5.2 5.2 0 0 0 1.214 1.867 5.2 5.2 0 0 0 1.88 1.213 8.663 8.663 0 0 0 3.013.56c1.72.094 2.226.094 6.573.094s4.854 0 6.573-.094a8.663 8.663 0 0 0 3.014-.56 5.2 5.2 0 0 0 1.88-1.213 5.2 5.2 0 0 0 1.213-1.867 8.8 8.8 0 0 0 .56-3.026c.093-1.72.093-2.227.093-6.574 0-4.346 0-4.853-.093-6.573Zm-3.387 10.667a7.597 7.597 0 0 1-.52 2.4 5.146 5.146 0 0 1-2.84 2.84 7.597 7.597 0 0 1-2.413.466h-8.16a7.598 7.598 0 0 1-2.413-.466 4.667 4.667 0 0 1-1.747-1.147 4.666 4.666 0 0 1-1.093-1.693 7.334 7.334 0 0 1-.453-2.414v-8.16c.014-.824.167-1.64.453-2.413a4.667 4.667 0 0 1 1.147-1.747 4.8 4.8 0 0 1 1.693-1.093 7.6 7.6 0 0 1 2.413-.467h8.16a7.6 7.6 0 0 1 2.413.467 4.667 4.667 0 0 1 1.747 1.147 4.665 4.665 0 0 1 1.093 1.693 7.6 7.6 0 0 1 .467 2.413V16c0 2.747.093 3.027.053 4.08v.014Zm-2.133-9.92a3.172 3.172 0 0 0-1.88-1.88 5.333 5.333 0 0 0-1.84-.294h-8a5.333 5.333 0 0 0-1.84.347 3.173 3.173 0 0 0-1.88 1.813 5.734 5.734 0 0 0-.28 1.84v8c.014.629.131 1.25.347 1.84a3.173 3.173 0 0 0 1.88 1.88 5.732 5.732 0 0 0 1.773.347h8a5.331 5.331 0 0 0 1.84-.347 3.172 3.172 0 0 0 1.88-1.88c.223-.588.34-1.21.347-1.84v-8c0-.63-.118-1.253-.347-1.84v.014Zm-7.72 10.92a5.08 5.08 0 0 1-5.08-5.094 5.093 5.093 0 1 1 5.08 5.094Zm5.334-9.187a1.2 1.2 0 0 1 0-2.387 1.2 1.2 0 0 1 0 2.387Z"
                                                />
                                            </svg>
                                            <div className="footer_link_bg" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Address */}
                    <div className="footer_info">
                        <div className="u-opacity-60 u-margin-bottom-2">Address</div>
                        <div className="u-text-style-small u-opacity-80 u-margin-bottom-1">
                            Chennai Institute of Technology
                        </div>
                        <div className="u-text-style-small u-opacity-80">
                            Sarathy Nagar, Kundrathur, Chennai - 600069.
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="footer_contact">
                        <div className="u-opacity-60 u-margin-bottom-2">Contact</div>
                        <a href="tel:+919940199440" className="footer_contact_link w-inline-block">
                            <div>+91 99401 99440</div>
                        </a>
                        <a href="tel:+919840998125" className="footer_contact_link w-inline-block">
                            <div>+91 98409 98125</div>
                        </a>
                    </div>
                </nav>
            </div>

            {/* Footer Bottom */}
            <div className="footer_bottom_wrap">
                <div className="footer_bottom_contain u-container">
                    <div className="footer_bottom_layout">
                        <div className="footer_bottom_text">
                            <span>© </span>
                            <span>{new Date().getFullYear()}</span>
                            <span> CIT TAKSHASHILA. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
