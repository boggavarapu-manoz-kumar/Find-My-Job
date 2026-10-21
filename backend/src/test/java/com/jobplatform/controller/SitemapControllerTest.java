package com.jobplatform.controller;

import com.jobplatform.entity.*;
import com.jobplatform.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SitemapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JobRepository jobRepository;

    @Test
    void shouldReturnValidSitemapXmlWithCorePages() throws Exception {
        mockMvc.perform(get("/sitemap.xml"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_XML))
            .andExpect(content().string(containsString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")))
            .andExpect(content().string(containsString("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">")))
            .andExpect(content().string(containsString("<loc>https://findmyjob.site/</loc>")))
            .andExpect(content().string(containsString("<loc>https://findmyjob.site/jobs</loc>")))
            .andExpect(content().string(containsString("<loc>https://findmyjob.site/categories</loc>")))
            .andExpect(content().string(containsString("<loc>https://findmyjob.site/about</loc>")))
            .andExpect(content().string(not(containsString("https://findmyjob.site/admin"))))
            .andExpect(content().string(not(containsString("https://findmyjob.site/candidate"))));
    }
}