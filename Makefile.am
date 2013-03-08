ACLOCAL_AMFLAGS = -I m4 -I libgd ${ACLOCAL_FLAGS}

SUBDIRS = libgd egg-list-box src data po

if ENABLE_GETTING_STARTED

SUBDIRS += getting-started

dist-hook-getting-started:
else
dist-hook-getting-started:
	@echo "*** --enable-getting-started must be specified in order to make dist"
	@false
endif

DISTCHECK_CONFIGURE_FLAGS = --enable-getting-started

EXTRA_DIST = \
    autogen.sh \
    COPYING \
    NEWS

stale-files-clean-local:
	-$(RM) $(abs_top_builddir)/*.la $(abs_top_builddir)/*.gir $(abs_top_builddir)/*.typelib

MAINTAINERCLEANFILES = \
    INSTALL \
    aclocal.m4 \
    config.log \
    config.status \
    configure

dist-hook: dist-hook-getting-started
